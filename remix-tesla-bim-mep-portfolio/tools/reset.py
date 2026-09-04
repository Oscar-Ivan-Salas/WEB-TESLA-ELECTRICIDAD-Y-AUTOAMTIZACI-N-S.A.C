"""Herramienta de reseteo del Hub TESLA BIM MEP.

Uso:
    python tools/reset.py --full     stop + clean + start + verify (default)
    python tools/reset.py --stop     apaga visor (3000) y conversor (5000)
    python tools/reset.py --clean    borra caches y salidas generadas
    python tools/reset.py --start    arranca de nuevo ambos servicios
    python tools/reset.py --verify   comprueba que ambos responden

Solo gestiona los puertos 3000 (Vite) y 5000 (Flask). No toca el 3001 (landing).
Sin dependencias externas (solo stdlib).
"""
import os
import shutil
import subprocess
import sys
import time
import urllib.request

TOOLS = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(TOOLS)
PORT_WEB = 3000
PORT_API = 5000
TEMP = os.environ.get('TEMP', os.environ.get('TMP', '.'))
LOGS = {
    'conv': os.path.join(TEMP, 'tesla_conv.log'),
    'conv_err': os.path.join(TEMP, 'tesla_conv_err.log'),
    'web': os.path.join(TEMP, 'tesla_web.log'),
    'web_err': os.path.join(TEMP, 'tesla_web_err.log'),
}


def _pids_on_port(port):
    pids = set()
    try:
        out = subprocess.check_output(['netstat', '-ano', '-p', 'tcp'], stderr=subprocess.DEVNULL)
        for line in out.decode(errors='ignore').splitlines():
            if 'LISTENING' not in line:
                continue
            if (':%d ' % port) in line or line.endswith(':%d ' % port) or (':%d' % port) in line:
                parts = line.split()
                if parts:
                    pids.add(parts[-1])
    except Exception as exc:
        print('  (aviso netstat: %s)' % exc)
    return pids


def stop():
    print('== STOP ==')
    for port, label in ((PORT_WEB, 'visor web'), (PORT_API, 'conversor')):
        pids = _pids_on_port(port)
        if not pids:
            print('  puerto %d (%s): nada escuchando' % (port, label))
            continue
        for pid in pids:
            try:
                subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
                print('  puerto %d (%s): PID %s terminado' % (port, label, pid))
            except Exception as exc:
                print('  puerto %d: no se pudo terminar PID %s (%s)' % (port, pid, exc))
    time.sleep(1.0)


def clean():
    print('== CLEAN ==')
    targets = [
        os.path.join(APP, 'outputs'),
        os.path.join(APP, 'dist'),
        os.path.join(APP, 'python', '__pycache__'),
        os.path.join(APP, 'tools', '__pycache__'),
    ]
    # NOTA: node_modules/.vite NO se borra a proposito. El proyecto vive en un HDD
    # y la re-optimizacion de dependencias de Vite lee ~40k archivos -> disco 100%.
    # node_modules esta junctioneado a C:\TeslaBimNMCache (SSD); mantener .vite caliente.
    for t in targets:
        if os.path.exists(t):
            shutil.rmtree(t, ignore_errors=True)
            print('  borrado: %s' % t)
    for f in list(LOGS.values()):
        if os.path.exists(f):
            os.remove(f)
            print('  borrado: %s' % f)
    print('  cache del navegador: usa Ctrl+Shift+R en http://localhost:3000 (no se puede borrar con script)')


def start():
    print('== START ==')
    conv = subprocess.Popen(
        ['python', os.path.join('python', 'server.py')],
        cwd=APP,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        stdout=open(LOGS['conv'], 'w'), stderr=open(LOGS['conv_err'], 'w'),
    )
    web = subprocess.Popen(
        ['cmd', '/c', 'npm run dev'],
        cwd=APP,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        stdout=open(LOGS['web'], 'w'), stderr=open(LOGS['web_err'], 'w'),
    )
    print('  conversor PID %d -> log %s' % (conv.pid, LOGS['conv']))
    print('  visor     PID %d -> log %s' % (web.pid, LOGS['web']))


def _poll(url, timeout=45):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=3) as r:
                return r.status, r.read(200).decode(errors='ignore').strip()
        except Exception:
            time.sleep(2)
    return None, None


def verify():
    print('== VERIFY ==')
    ok = True
    status, body = _poll('http://localhost:%d/health' % PORT_API)
    if status == 200:
        print('  OK conversor  /health %s' % body)
    else:
        print('  FAIL conversor /health (%s)' % status)
        ok = False
    status, _ = _poll('http://localhost:%d/' % PORT_WEB)
    if status == 200:
        print('  OK visor      http://localhost:%d/ (%s)' % (PORT_WEB, status))
    else:
        print('  FAIL visor http://localhost:%d/ (%s)' % (PORT_WEB, status))
        ok = False
    print('RESULTADO:', 'TODO FUNCIONA' if ok else 'HAY FALLOS')
    return ok


def main():
    mode = '--full'
    for a in ('--stop', '--clean', '--start', '--verify', '--full'):
        if a in sys.argv:
            mode = a
    ok = True
    if mode in ('--full', '--stop'):
        stop()
    if mode in ('--full', '--clean'):
        clean()
    if mode in ('--full', '--start'):
        start()
        time.sleep(3)
    if mode in ('--full', '--verify'):
        ok = verify()
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
