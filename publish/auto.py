import subprocess
import argparse
import os
import paramiko
import scpclient


base_root = os.path.split(os.path.realpath(__file__))[0]
os.chdir(base_root)


parser = argparse.ArgumentParser()
parser.add_argument("-d", "--debug", action="store_true", help="Debug model")
parser.add_argument("-n", "--npm", action="store_true", help="npm build before upload")
parser.add_argument("-u", "--upload", type=int, help="upload number")

def npm_build(debug, root):
    os.chdir(os.path.join(root, "../npm/"))
    order = ["C:\\Program Files\\nodejs\\npm.cmd", "run"]
    if debug:
        order.append("build_debug")
    else:
        order.append("build")
    sub = subprocess.Popen(order)
    if not sub:
        return False
    sub.communicate()
    os.chdir(root)
    return True

global_upload = [
    {
        "ip": "192.168.228.129",
        "root": "/home/de/gpsmap/",
        "user": "de",
        "pass": "de",
    },
    {
        "ip": "192.168.199.193",
        "root": "/home/abcd/gpsmap/",
        "user": "abcd",
        "pass": "123456",
    },
]

def upload_files_ssh(upload, root):
    os.chdir(root)
    suit = global_upload[upload]
    client = paramiko.SSHClient()
    client.connect(hostname=suit["ip"], username=suit["user"], password=suit["pass"], timeout=5)
    with scpclient(ssh.get_transport()) as scp:
        scp.put('./system', suit["path"]+"system/")


def upload_files_bat(upload, root):
    os.chdir(root)
    env = global_upload[upload]
    env["PATH"] = os.environ.get("PATH")
    print(env)
    sub = subprocess.Popen([os.path.join(root, "./upload.bat")], env=env, shell=True)
    if not sub:
        return False
    pair = sub.communicate()
    print(pair[0])
    print(pair[1])

def main(debug, npm, upload):
    if npm and not npm_build(debug, base_root):
        return


if __name__ == "__main__":
    args = parser.parse_args()
    try:
        main(args.debug, args.npm, args.upload)
    except Exception as e:
        print(e)