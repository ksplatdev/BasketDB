[ -d "./dist" ] && rm -rf ./dist/* && echo "Cleaned dist directory"

echo "Compiling"
tsc
echo "Compiled"