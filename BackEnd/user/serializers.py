from rest_framework import serializers

class UserResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    # Expõe o ID do instrutor na resposta
    instrutor_id = serializers.IntegerField(source='instrutor.id', allow_null=True, read_only=True)

class UserCreateUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.CharField(required=False)