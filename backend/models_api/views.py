from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from .models import Model3D
from .serializers import Model3DSerializer


class Model3DListCreateView(generics.ListCreateAPIView):
    queryset = Model3D.objects.all()
    serializer_class = Model3DSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Model3DDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Model3D.objects.all()
    serializer_class = Model3DSerializer
    parser_classes = (MultiPartParser, FormParser)


def health_check(request):
    return JsonResponse({'status': 'OK', 'message': 'AR Backend is running'})
