# 🏆 FIFA 2026 Álbum Tracker — Guía de instalación

## Lo que necesitas (todo gratis, sin tarjeta de crédito)
- Una cuenta en supabase.com
- Una cuenta en vercel.com
- Una cuenta en github.com

---

## PASO 1 — Configurar Supabase (base de datos en la nube)

1. Ve a https://supabase.com y crea una cuenta gratis
2. Haz clic en "New Project"
   - Nombre: mundial2026
   - Database Password: pon una contraseña segura (guárdala)
   - Region: South America (São Paulo)
3. Espera ~2 minutos mientras se crea el proyecto
4. En el menú izquierdo ve a **SQL Editor**
5. Pega este código y ejecuta (botón RUN):

```sql
create table stickers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  sticker_code text not null,
  have boolean default false,
  updated_at timestamp default now(),
  unique(user_id, sticker_code)
);

alter table stickers enable row level security;

create policy "Users can manage their own stickers"
on stickers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

6. Ve a **Project Settings → API**
7. Copia estos dos valores:
   - **Project URL** → algo como https://abcdefgh.supabase.co
   - **anon public key** → una clave larga

8. Abre el archivo `js/app.js` con el Bloc de Notas
9. Reemplaza las líneas al inicio:
   ```
   const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
   ```
   con tus valores reales.

---

## PASO 2 — Subir el código a GitHub

1. Ve a https://github.com y crea una cuenta gratis
2. Haz clic en "New repository"
   - Nombre: mundial2026
   - Selecciona "Public"
   - Clic en "Create repository"
3. En la página del repositorio, haz clic en "uploading an existing file"
4. Arrastra TODOS los archivos y carpetas de esta carpeta
5. Escribe un mensaje como "primera versión" y haz clic en "Commit changes"

---

## PASO 3 — Publicar en Vercel (tu web en internet)

1. Ve a https://vercel.com y crea una cuenta (puedes entrar con tu cuenta de GitHub)
2. Haz clic en "Add New Project"
3. Selecciona tu repositorio "mundial2026"
4. Haz clic en "Deploy"
5. ¡Listo! En ~1 minuto tendrás tu URL pública, algo como:
   https://mundial2026.vercel.app

---

## PASO 4 — Instalar como app en el celular

### En Android:
1. Abre Chrome en tu celular
2. Ve a tu URL de Vercel
3. Toca el menú (⋮) → "Añadir a pantalla de inicio"
4. ¡Aparece como app en tu celular!

### En iPhone:
1. Abre Safari
2. Ve a tu URL de Vercel
3. Toca el botón compartir (□↑) → "Añadir a pantalla de inicio"
4. ¡Listo!

---

## PASO 5 — Activar confirmación de email en Supabase (opcional)

Por defecto Supabase pide confirmar el email. Para saltarlo durante pruebas:
1. En Supabase ve a Authentication → Providers → Email
2. Desactiva "Confirm email"

---

## ¿Problemas?
- Si la app no carga: verifica que SUPABASE_URL y SUPABASE_ANON_KEY estén correctos en js/app.js
- Si no guarda: verifica que ejecutaste el SQL del Paso 1 correctamente
- Si no aparece la opción de instalar: asegúrate de estar en Chrome (Android) o Safari (iPhone)
