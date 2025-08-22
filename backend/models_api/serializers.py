from rest_framework import serializers
from .models import Model3D


class Model3DSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model3D
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'file_size')

    def validate_model_file(self, value):
        # Additional validation for file size (10MB limit)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File too large. Size should not exceed 10MB.")
        return value
