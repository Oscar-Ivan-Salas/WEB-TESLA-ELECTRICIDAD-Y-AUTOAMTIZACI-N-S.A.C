# 🔐 Guía de Recuperación de Contraseña - Supabase

Como tienes acceso al panel de Supabase, la forma más rápida y segura de establecer una contraseña (cuando no recuerdas la anterior) es usando el **Editor SQL**.

## 🚀 Método 1: Resetear vía SQL (Recomendado)

Este método fuerza el cambio de contraseña inmediatamente sin necesitar correo de confirmación.

1.  Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2.  En el menú lateral izquierdo, busca el ícono de **SQL Editor** (parece una terminal `>_`).
3.  Haz clic en **"New Query"** (Nueva Consulta).
4.  Copia y pega el siguiente código (reemplaza `tu_nueva_clave` y el `email`):

```sql
-- Reemplaza 'tu_nueva_clave' por la contraseña que quieras usar
-- Reemplaza 'admin@tesla-electricidad.com' por el correo de tu usuario

UPDATE auth.users
SET encrypted_password = crypt('tu_nueva_clave', gen_salt('bf'))
WHERE email = 'admin@tesla-electricidad.com';
```

5.  Haz clic en **Run** (botón verde).
6.  ✅ **Listo.** Ya puedes ir a `login.html` e ingresar con esa nueva contraseña.

---

## 🛠️ Método 2: Crear Nuevo Usuario (Si el anterior no existe)

Si al correr el anterior no pasa nada (dice "Rows affected: 0"), es porque el usuario no existe. Créalo así:

1.  Ve a **Authentication** (ícono de candado) > **Users**.
2.  Arriba a la derecha, botón verde **"Add User"**.
3.  Ingresa el correo y la contraseña que desees.
4.  Marca "Auto-confirm user" (importante).
5.  Clic en **Create User**.

---

## 📧 Método 3: Enviar Correo de Recuperación

1.  Ve a **Authentication** > **Users**.
2.  Busca tu usuario en la lista.
3.  Clic en los 3 puntos `...` a la derecha.
4.  Selecciona **"Send password recovery"**.
5.  Te llegará un email para cambiarla.
