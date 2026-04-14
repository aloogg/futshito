# Proyecto Red Social Deportiva

Este proyecto es una aplicación web estilo red social enfocada en publicaciones relacionadas con deportes. Cuenta con roles de usuario y administrador, manejo de publicaciones, comentarios, categorías y una integración con una API de datos curiosos deportivos.

---

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [XAMPP](https://www.apachefriends.org/index.html) (Apache + MySQL)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- Navegador web (Chrome, Firefox, etc.)

---

## Configuración de XAMPP

1. Cambiar el puerto de MySQL:  
   - Abre el archivo `config.inc.php` de XAMPP y cambia el puerto de 3306 a 3307.  
   (Este paso ya se realizó pero es importante recordarlo)

2. Colocar el proyecto en la carpeta `htdocs` de XAMPP:  
   - La ruta final debería ser algo como:  
     ```
     C:\xampp\htdocs\NombreDelProyecto\
     ```

---

## Configuración de la Base de Datos

1. Abrir MySQL Workbench y crear una conexión con puerto 3307.
2. Ejecutar el script SQL que se encuentra dentro de la carpeta del proyecto (generalmente llamado `query.sql` o similar) para crear la base de datos y todas las tablas necesarias.
3. Asegúrate de que la conexión en tu proyecto (archivos PHP) use el puerto 3307.

---

## Ejecutar la Aplicación

1. Inicia Apache y MySQL desde el panel de XAMPP.
2. Abre en tu navegador: http://localhost:8012/Capa/login.html

Esto abrirá la pantalla de login, que es la primera vista del usuario.

---

## Funcionalidad del Proyecto

### Pantalla de Login

- Permite ingresar con una cuenta existente.
- Si no tienes cuenta, hay dos opciones:
1. Continuar como invitado: Acceso limitado a ciertas funciones, que debido al middleware esta opción quedo básicamente no funcional.
2. Crear cuenta: Redirige a la página de registro para crear un nuevo usuario.

### Usuario Normal

Una vez registrado o como invitado, el usuario puede:

- Ver la página de inicio con publicaciones del administrador.
- En la sección Publicaciones:
- Crear publicaciones propias.
- Comentar y dar "like" a publicaciones de otros usuarios.
- En Datos Curiosos:
- Consultar datos curiosos de usuarios.
- Consultar datos deportivos de terceros a través de la API de [TheSportsDB](https://www.thesportsdb.com/).
- Ver y editar su perfil.
- Cerrar sesión y volver a login.

### Administrador

- Iniciar sesión con correo: `"aloos"` y contraseña: `"123"`.
- Funcionalidades especiales:
- Crear categorías.
- Crear publicaciones sobre mundiales.
- Aprobar o rechazar publicaciones de usuarios.
- Aprobar o rechazar comentarios de usuarios.

---

