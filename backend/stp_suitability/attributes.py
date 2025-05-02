# attributes.py or views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
import os
import logging
import traceback
from django.conf import settings

logger = logging.getLogger(__name__)

class GetMultipleAttributesView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Received request: {request.data}")
            
            # Check if we have file IDs or actual files
            file_names = []
            
            # Process file IDs if provided
            if 'fileIds' in request.data:
                file_ids = request.data.getlist('fileIds') if hasattr(request.data, 'getlist') else request.data['fileIds'].split(',')
                logger.info(f"Processing file IDs: {file_ids}")
                
                # Convert IDs back to filenames
                for file_id in file_ids:
                    file_name = file_id.replace('_', '.', 1)
                    file_names.append(file_name)
            
            # Process files if uploaded
            if 'files' in request.FILES:
                files = request.FILES.getlist('files')
                logger.info(f"Received {len(files)} uploaded files: {[f.name for f in files]}")
                
                # Add uploaded filenames to the list
                for file in files:
                    file_names.append(file.name)
                    
                    # Save the uploaded files temporarily
                    temp_file_path = os.path.join('/tmp', file.name)
                    with open(temp_file_path, 'wb+') as destination:
                        for chunk in file.chunks():
                            destination.write(chunk)
            
            if not file_names:
                logger.error("No files or file IDs provided in request")
                return Response({'error': 'No files or file IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Base directories where files are stored
            base_dirs = [
                os.path.join(settings.MEDIA_ROOT, 'stp_suitability', 'constraintsFactors'),
                os.path.join(settings.MEDIA_ROOT, 'stp_suitability', 'conditioningFactors')
            ]
            
            # Log the directories we're searching in
            for base_dir in base_dirs:
                logger.info(f"Searching in directory: {base_dir}")
                if not os.path.exists(base_dir):
                    logger.error(f"Directory does not exist: {base_dir}")
                else:
                    logger.info(f"Directory exists: {base_dir}")
                    # List all files in directory for debugging
                    for root, _, files_in_dir in os.walk(base_dir):
                        logger.info(f"Files in {root}: {files_in_dir}")
            
            attributes_result = {}
            
            # Process each file
            for file_name in file_names:
                base_name = os.path.splitext(file_name)[0]
                logger.info(f"Processing file: {file_name}, base name: {base_name}")
                
                # First check if this is a temp uploaded file
                temp_file_path = os.path.join('/tmp', file_name)
                if os.path.exists(temp_file_path):
                    logger.info(f"Using uploaded file from temp location: {temp_file_path}")
                    
                    # For shapefiles, ensure all associated files are present
                    if temp_file_path.lower().endswith('.shp'):
                        self.ensure_shapefile_components(temp_file_path)
                    
                    attributes = self.extract_attributes(temp_file_path)
                    attributes_result[base_name] = attributes
                    continue
                
                # Look for the file in the base directories
                file_path = None
                for base_dir in base_dirs:
                    for root, _, files_in_dir in os.walk(base_dir):
                        for f in files_in_dir:
                            # Try multiple matching strategies
                            if (f.lower() == file_name.lower() or 
                                os.path.splitext(f)[0].lower() == base_name.lower() or
                                f.lower().startswith(base_name.lower() + ".")):
                                
                                file_path = os.path.join(root, f)
                                logger.info(f"Found matching file: {file_path}")
                                break
                        if file_path:
                            break
                    if file_path:
                        break
                
                if file_path:
                    # Extract attributes
                    attributes = self.extract_attributes(file_path)
                    attributes_result[base_name] = attributes
                else:
                    logger.error(f"No matching file found for: {file_name}")
                    attributes_result[base_name] = []
            
            # Clean up temp files
            for file_name in file_names:
                temp_file_path = os.path.join('/tmp', file_name)
                if os.path.exists(temp_file_path):
                    try:
                        os.remove(temp_file_path)
                        logger.info(f"Removed temp file: {temp_file_path}")
                    except:
                        logger.error(f"Failed to remove temp file: {temp_file_path}")
            
            logger.info(f"Final attributes result: {attributes_result}")
            
            # Add CORS headers for development
            return Response(
                {'attributes': attributes_result}, 
                status=status.HTTP_200_OK,
                headers={
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing attributes request: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def ensure_shapefile_components(self, shp_path):
        """
        For uploaded shapefiles, make sure all the necessary component files are present.
        If the DBF file is missing, try to find it in the upload.
        """
        base_path = os.path.splitext(shp_path)[0]
        dbf_path = base_path + '.dbf'
        
        if not os.path.exists(dbf_path):
            logger.warning(f"DBF file not found at {dbf_path}, looking in uploads...")
            # Check if DBF was uploaded separately
            for f in os.listdir('/tmp'):
                if f.lower().endswith('.dbf') and os.path.splitext(f)[0].lower() == os.path.basename(base_path).lower():
                    logger.info(f"Found matching DBF file: {f}")
                    break
    
    def extract_attributes(self, file_path):
        """Extract attributes from a spatial file based on its type"""
        logger.info(f"Extracting attributes from: {file_path}")
        
        # Only try to extract attributes if the file exists
        if not os.path.exists(file_path):
            logger.error(f"File does not exist: {file_path}")
            return []
        
        try:
            if file_path.lower().endswith('.shp'):
                # For shapefiles, prioritize getting attributes from the DBF file
                dbf_path = os.path.splitext(file_path)[0] + '.dbf'
                if os.path.exists(dbf_path):
                    logger.info(f"Found associated DBF file: {dbf_path}")
                    dbf_attributes = self.extract_dbf_attributes(dbf_path)
                    if dbf_attributes:
                        return dbf_attributes
                
                # If DBF doesn't exist or returns no attributes, try getting them from the shapefile
                return self.extract_shapefile_attributes(file_path)
            elif file_path.lower().endswith('.dbf'):
                return self.extract_dbf_attributes(file_path)
            else:
                logger.warning(f"Unsupported file type for attribute extraction: {file_path}")
                return []
        except Exception as e:
            logger.error(f"Error extracting attributes: {str(e)}")
            logger.error(traceback.format_exc())
            return []
    
    def extract_shapefile_attributes(self, file_path):
        """Extract attributes from a shapefile using multiple methods"""
        # Try geopandas first (most robust)
        try:
            import geopandas as gpd
            logger.info(f"Reading shapefile with geopandas: {file_path}")
            gdf = gpd.read_file(file_path)
            
            # Get attribute columns (exclude geometry)
            columns = [col for col in gdf.columns if col.lower() != 'geometry']
            if columns:
                logger.info(f"Extracted attributes using geopandas: {columns}")
                return columns
            else:
                logger.warning(f"No attributes found with geopandas")
        except Exception as e:
            logger.error(f"Geopandas extraction failed: {str(e)}")
        
        # Try pyshp as fallback
        try:
            import shapefile
            logger.info(f"Reading shapefile with pyshp: {file_path}")
            sf = shapefile.Reader(file_path)
            fields = [field[0] for field in sf.fields if field[0] != 'DeletionFlag']
            if fields:
                logger.info(f"Extracted attributes using pyshp: {fields}")
                return fields
            else:
                logger.warning(f"No attributes found with pyshp")
        except Exception as e2:
            logger.error(f"Pyshp extraction failed: {str(e2)}")
        
        # Try fiona as another fallback
        try:
            import fiona
            logger.info(f"Reading shapefile with fiona: {file_path}")
            with fiona.open(file_path) as source:
                schema = source.schema
                fields = list(schema['properties'].keys())
                if fields:
                    logger.info(f"Extracted attributes using fiona: {fields}")
                    return fields
                else:
                    logger.warning(f"No attributes found with fiona")
        except Exception as e3:
            logger.error(f"Fiona extraction failed: {str(e3)}")
        
        # Try other shapefiles in the same directory with the same basename
        logger.info(f"Looking for related files for {file_path}")
        dirname, filename = os.path.split(file_path)
        basename = os.path.splitext(filename)[0]
        
        for f in os.listdir(dirname):
            if f.startswith(basename + '.') and f.lower().endswith('.dbf'):
                dbf_path = os.path.join(dirname, f)
                logger.info(f"Found related DBF file: {dbf_path}")
                dbf_attributes = self.extract_dbf_attributes(dbf_path)
                if dbf_attributes:
                    return dbf_attributes
        
        # If all methods fail, return empty list instead of defaults
        logger.warning(f"All extraction methods failed, returning empty attribute list")
        return []
    
    def extract_dbf_attributes(self, file_path):
        """Extract attributes from a DBF file"""
        if not os.path.exists(file_path):
            logger.error(f"DBF file does not exist: {file_path}")
            return []
        
        # Try dbfread first (usually most reliable for DBF files)
        try:
            import dbfread
            logger.info(f"Reading DBF with dbfread: {file_path}")
            table = dbfread.DBF(file_path)
            fields = table.field_names
            if fields:
                logger.info(f"Extracted attributes from DBF using dbfread: {fields}")
                return fields
            else:
                logger.warning(f"No fields found in DBF using dbfread")
        except Exception as e:
            logger.error(f"Dbfread extraction failed: {str(e)}")
        
        # Try simpledbf
        try:
            from simpledbf import Dbf5
            logger.info(f"Reading DBF with simpledbf: {file_path}")
            dbf = Dbf5(file_path)
            df = dbf.to_dataframe()
            columns = list(df.columns)
            if columns:
                logger.info(f"Extracted attributes from DBF using simpledbf: {columns}")
                return columns
            else:
                logger.warning(f"No columns found in DBF using simpledbf")
        except Exception as e2:
            logger.error(f"Simpledbf extraction failed: {str(e2)}")
        
        # Try pandas as last resort
        try:
            import pandas as pd
            logger.info(f"Reading DBF with pandas: {file_path}")
            # Try different pandas methods
            try:
                # Try using pyarrow engine
                df = pd.read_table(file_path, sep='\t')
            except:
                try:
                    # Try using PyTables
                    store = pd.HDFStore(file_path)
                    df = store.select('table')
                    store.close()
                except:
                    # Last attempt - try to read as csv
                    df = pd.read_csv(file_path, encoding='latin1')
            
            columns = list(df.columns)
            if columns:
                logger.info(f"Extracted attributes from DBF using pandas: {columns}")
                return columns
            else:
                logger.warning(f"No columns found in DBF using pandas")
        except Exception as e3:
            logger.error(f"Pandas extraction failed: {str(e3)}")
        
        # If all methods fail, return empty list
        logger.warning(f"All DBF extraction methods failed for {file_path}")
        return []