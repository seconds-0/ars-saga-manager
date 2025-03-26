#!/bin/bash

# WSL Performance optimization script
# This script applies several WSL-specific optimizations that might help with test performance

echo "Applying WSL Performance Optimizations..."

# 1. Create/update .wslconfig in Windows home directory
echo "Creating .wslconfig in Windows home directory..."
WINDOWS_HOME=$(wslpath "$(wslvar USERPROFILE)")
CONFIG_FILE="$WINDOWS_HOME/.wslconfig"

cat > "$CONFIG_FILE" << EOF
[wsl2]
memory=8GB
processors=4
swap=4GB
localhostForwarding=true
kernelCommandLine=sysctl.vm.swappiness=10
EOF

echo "Created .wslconfig with optimized settings"

# 2. WSL memory settings
echo "Applying memory optimization settings..."
sudo sysctl -w vm.swappiness=10
sudo sysctl -w vm.vfs_cache_pressure=50

# 3. Disk I/O optimizations for WSL
echo "Applying disk I/O optimizations..."
if grep -q "fstab" /etc/fstab; then
  echo "fstab entries already exist"
else
  sudo tee -a /etc/fstab > /dev/null << EOF
# Optimize disk I/O for WSL
tmpfs /tmp tmpfs defaults,noatime,mode=1777 0 0
EOF
  sudo mount -a
fi

# 4. Node.js optimizations
echo "Applying Node.js optimizations..."
export NODE_OPTIONS="--max-old-space-size=4096"

# 5. Jest optimizations for faster testing
mkdir -p ~/.jest
cat > ~/.jest/config.json << EOF
{
  "cache": true,
  "maxWorkers": "50%",
  "haste": {
    "enableSymlinks": false
  },
  "watchman": false
}
EOF

echo "Created global Jest configuration"

echo "Optimizations complete. You should restart WSL for changes to take effect."
echo "To restart WSL, open PowerShell as administrator and run:"
echo "wsl --shutdown"
echo "Then restart your WSL terminal."