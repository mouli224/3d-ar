from django.db import models
from django.core.validators import FileExtensionValidator


class Model3D(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    model_file = models.FileField(
        upload_to='models/3d/',
        validators=[FileExtensionValidator(allowed_extensions=['glb', 'gltf', 'obj', 'fbx'])]
    )
    thumbnail = models.ImageField(upload_to='models/thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_size = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.model_file:
            self.file_size = self.model_file.size
        super().save(*args, **kwargs)
