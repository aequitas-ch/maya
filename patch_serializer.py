with open("backend/core/serializers.py", "r") as f:
    content = f.read()

new_serializer = """
class AdminSetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True)
"""

if "AdminSetPasswordSerializer" not in content:
    with open("backend/core/serializers.py", "w") as f:
        f.write(content + "\n" + new_serializer)
        print("Serializer added")
else:
    print("Serializer already exists")
