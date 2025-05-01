from django.db import models
class StpFile(models.Model):
    name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "STP File"
        verbose_name_plural = "STP Files"
    
    def __str__(self):
        return self.name

    @property
    def file_extension(self):
        return os.path.splitext(self.name)[1][1:].lower()

# Create your models here.
