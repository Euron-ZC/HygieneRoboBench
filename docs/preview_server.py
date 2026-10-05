"""Static preview with byte ranges, so browser video seeking works locally."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import argparse
import re


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.byte_range = None
        path = Path(self.translate_path(self.path))
        value = self.headers.get('Range')
        if not value or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', value)
        if not match:
            return super().send_head()
        size = path.stat().st_size
        first, last = match.groups()
        start = int(first) if first else max(0, size-int(last))
        end = min(int(last), size-1) if first and last else size-1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        stream = path.open('rb')
        stream.seek(start)
        self.byte_range = (start, end)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(end-start+1))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return stream

    def copyfile(self, source, output):
        try:
            if self.byte_range is None:
                return super().copyfile(source, output)
            remaining = self.byte_range[1]-self.byte_range[0]+1
            while remaining:
                block = source.read(min(1024*1024, remaining))
                if not block:
                    break
                output.write(block)
                remaining -= len(block)
        except (BrokenPipeError, ConnectionResetError):
            pass  # The player can cancel a request when seeking elsewhere.


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8767)
    parser.add_argument('--directory', default='.')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=args.directory))
    print(f'Preview: http://127.0.0.1:{args.port}', flush=True)
    server.serve_forever()
