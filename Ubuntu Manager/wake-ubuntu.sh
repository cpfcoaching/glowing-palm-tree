#!/bin/bash
# wake-ubuntu.sh - Wakes up the Ubuntu machine 192.168.24.4
# Uses python to send a magic packet if wakeonlan utility is not found

MAC="3c:cd:36:61:a6:4d"
IP="192.168.24.4"

echo "Attempting to wake Ubuntu machine at $MAC ($IP)..."

if command -v wakeonlan &> /dev/null; then
    wakeonlan $MAC
else
    # Fallback to python
    python3 -c "
import socket
import struct

mac = '$MAC'.replace(':', '')
data = bytes.fromhex('FF' * 6 + mac * 16)
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sock.sendto(data, ('<broadcast>', 9))
sock.sendto(data, ('$IP', 9))
"
fi
echo "Wake-on-LAN packet sent!"
