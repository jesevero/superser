#!/bin/bash
# Dashboard360 - Script de configuração
# Rode dentro da pasta dashboard360 criada pelo create-expo-app

echo "=== Dashboard360 - Configurando projeto ==="

# 1. Atualizar main no package.json para usar expo-router
if command -v python3 &> /dev/null; then
  python3 -c "
import json
with open('package.json','r') as f: pkg = json.load(f)
pkg['main'] = 'expo-router/entry'
with open('package.json','w') as f: json.dump(pkg, f, indent=2)
print('package.json atualizado: main -> expo-router/entry')
"
else
  echo "ATENÇÃO: Python3 não encontrado. Edite package.json manualmente:"
  echo '  Troque "main": "..." por "main": "expo-router/entry"'
fi

# 2. Remover App.tsx padrão (expo-router usa a pasta app/)
rm -f App.tsx app.tsx
echo "App.tsx removido (expo-router usa app/_layout.tsx)"

echo ""
echo "=== Pronto! Agora rode: npx expo start ==="
