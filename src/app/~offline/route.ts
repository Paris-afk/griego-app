export function GET() {
  return new Response(
    `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#FAF6F0" />
    <title>Sin conexión — Griego App</title>
    <style>
      body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FAF6F0;color:#2B2622;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",system-ui,sans-serif;padding:24px}
      .card{max-width:420px;text-align:center}
      h1{font-family:Newsreader,Georgia,serif;font-size:28px;margin:0 0 8px}
      p{font-size:15px;color:#6E6155;line-height:1.5;margin:0}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Estás sin conexión</h1>
      <p>Griego App necesita internet. Vuelve a conectarte para seguir con tu lección.</p>
    </div>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
