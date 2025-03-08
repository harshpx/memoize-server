const defaultAvatar = "data:image/svg+xml;base64,CiAgPHN2ZwogICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICAgdmVyc2lvbj0iMS4xIgogICAgd2lkdGg9IjQwMCIKICAgIGhlaWdodD0iNDAwIgogICAgdmlld0JveD0iMCAwIDUwMCA1MDAiCiAgPgogICAgCiAgPHJlY3QKICAgIHdpZHRoPSI1MDAiCiAgICBoZWlnaHQ9IjUwMCIKICAgIHJ4PSIyNTAiCiAgICBmaWxsPSIjZTRlM2NkIgogIC8+CgogICAgPHBhdGggZmlsbD0iIzk5YzliZCIgZD0iTTQ0MC43IDI4MC4yYzAgNi43LS40IDEzLjEtMS4yIDE5LjItMS4xIDcuOS0yLjkgMTUuMi01LjMgMjEuOWE4Ni4zIDg2LjMgMCAwMS0yMC43IDMyLjZDMzkzIDM3NC4zIDM2MiAzODUuMiAzMjUgMzkwLjZjLTIzIDMuMy00OC4zIDQuNS03NC45IDQuNWE1MjkgNTI5IDAgMDEtNzUtNC42Yy02OC05LjgtMTE1LjctMzguNC0xMTUuNy0xMTAuMyAwLTk2LjMgODUuNC0xNzQuMyAxOTAuNy0xNzQuMyA5NS43IDAgMTc1IDY0LjQgMTg4LjYgMTQ4LjNhMTYxIDE2MSAwIDAxMi4xIDI2eiIvPgogIAogICAgPHBhdGggZmlsbD0iI2I3ZTdkYiIgZD0iTTE1NiAzODcuMWMtNTcuOC0xMi4zLTk2LjctNDItOTYuNy0xMDcgMC05LjQuOC0xOC42IDIuNC0yNy42IDE5LjEgMy40IDM5LjMgMTcgNTMuNiAzOC4xYTEwNSAxMDUgMCAwMTUgOC4yIDczLjYgNzMuNiAwIDAwMjEgMjMuOGM0LjkgMy42IDkuNSA4LjMgMTMuMyAxNCAxMi4zIDE4LjIgMTIuNiA0MCAxLjMgNTAuNXoiLz4KICAKICAgIDxwYXRoIGZpbGw9IiM1ZDhkODEiIGQ9Ik00Ni4xIDIwNS41YzItMzQuMiA3My41LTgwLjMgOTcuNS04MC4zUzExOSAyMzUuMiAxMDcgMjQzLjVzLTYyLjgtMy43LTYxLTM4ek00NTQgMjA1LjVjLTItMzQuMi03My41LTgwLjMtOTcuNS04MC4zczI0LjYgMTEwIDM2LjQgMTE4LjMgNjIuOS0zLjcgNjEtMzh6Ii8+CiAgCiAgICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjk5LjkgMzA3LjJjMCAzNS0yMi4zIDYzLjMtNDkuOSA2My4zcy00OS45LTI4LjMtNDkuOS02My4zIDIyLjQtNDYuNyA0OS45LTQ2LjcgNDkuOSAxMS44IDQ5LjkgNDYuN3oiLz4KICAgIDxwYXRoIGZpbGw9IiNmMzI1MmYiIGQ9Ik0yNTAgMzE1bDEyLjMgNy44YzAgMjMtMjQuMiAyMy4yLTI0LjQuNHYtLjRsMTIuMS03Ljd6Ii8+CiAgICA8cGF0aCBmaWxsPSIjMTUyMTJhIiBkPSJNMjg1LjIgMzE2Yy0uOC0uMy0xLjYuMi0xLjggMS0uOSAyLjktMy4xIDQuOC02LjcgNS43QTI2LjUgMjYuNSAwIDAxMjU0IDMxNmMtLjUtLjUtMS0xLTEuMy0xLjZ2LTcuMmMxNS0xIDI2LjctMTEgMjYuNy0yMi45IDAtMTIuNy0xMy4yLTExLjItMjkuNC0xMS4ycy0yOS40LTEuNS0yOS40IDExLjJjMCAxMiAxMS44IDIxLjkgMjYuOCAyMi45djdjLS40LjctLjkgMS4zLTEuNCAxLjhhMjYuNiAyNi42IDAgMDEtMjIuNyA2LjZjLTMuNi0xLTUuOS0yLjgtNi43LTUuNy0uMi0uOC0xLTEuMy0xLjgtMS0uOC4yLTEuMyAxLTEgMS44IDEgNCA0LjEgNi42IDguNyA3LjhhMjkuOSAyOS45IDAgMDAyNS42LTcuM2MuOC0uOCAxLjQtMS42IDEuOS0yLjQuNS44IDEuMSAxLjYgMS45IDIuM2EyOS45IDI5LjkgMCAwMDI1LjYgNy40YzQuNi0xLjIgNy42LTMuOSA4LjgtNy44LjItLjgtLjMtMS42LTEtMS45eiIvPgogIAogICAgPGNpcmNsZSBjeD0iMTY5IiBjeT0iMjUwIiByPSIyMC40IiBmaWxsPSIjMTUyMTJhIi8+CiAgICA8Y2lyY2xlIGN4PSIxNzUuNCIgY3k9IjI1NS44IiByPSI5LjYiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgY3g9IjE1OS40IiBjeT0iMjQxIiByPSI0LjIiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgY3g9IjMzMSIgY3k9IjI1MCIgcj0iMjAuNCIgZmlsbD0iIzE1MjEyYSIvPgogICAgPGNpcmNsZSBjeD0iMzI0LjYiIGN5PSIyNTUuOCIgcj0iOS42IiBmaWxsPSIjZmZmIi8+CiAgICA8Y2lyY2xlIGN4PSIzNDAuNiIgY3k9IjI0MSIgcj0iNC4yIiBmaWxsPSIjZmZmIi8+CiAgCiAgICA8cGF0aCBmaWxsPSIjMTUyMTJhIiBkPSJNMzMzIDE5Ni43aC0uNGwtMjcuNi0yLjFhNSA1IDAgMDEuOC0xMGwyNy41IDJhNSA1IDAgMDEtLjMgMTB6TTE2Ni42IDE5Ni43aC40bDI3LjUtMi4xYTUgNSAwIDAwLS43LTEwbC0yNy42IDJhNSA1IDAgMDAuNCAxMHoiLz4KICAKICA8cGF0aAogICAgZD0iTTI1MCwwYTI1MCwyNTAgMCAxLDEgMCw1MDAiCiAgICBmaWxsPSIjMTUyMTJhIgogICAgZmlsbC1vcGFjaXR5PSIwLjA4IgogIC8+CgogIDwvc3ZnPgo="

export default defaultAvatar;