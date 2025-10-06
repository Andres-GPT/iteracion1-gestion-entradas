/**
 * Plantilla de correo para recuperación de contraseña
 */
export const forgotPasswordTemplate = (name: string, link: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #b71c1c 0%, #8f1616 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Control de Entradas y Salidas</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #b71c1c; margin-top: 0;">Recuperación de Contraseña</h2>

    <p>Estimado/a <strong>${name}</strong>,</p>

    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Entendemos lo importante que es mantener tu información segura y protegida.</p>

    <p>Para continuar con el proceso de restablecimiento de contraseña, por favor haz clic en el siguiente botón:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" style="background-color: #b71c1c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Restablecer Contraseña
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
    <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; font-size: 12px; color: #b71c1c;">
      ${link}
    </p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #856404;">
        <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.
      </p>
    </div>

    <p>Si no solicitaste este cambio o no reconoces esta solicitud, por favor ignora este mensaje y ponte en contacto con nuestro equipo de soporte lo antes posible.</p>

    <p>Recuerda que es importante elegir una contraseña segura y única para tu cuenta, y evitar compartirla con nadie.</p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="margin-bottom: 5px;">Gracias por confiar en nosotros.</p>
    <p style="margin-top: 5px;"><strong>Atentamente,</strong></p>
    <p style="margin-top: 5px; color: #b71c1c; font-weight: bold;">El Equipo de Control de Entradas y Salidas</p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`;
