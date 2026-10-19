# AGENTS.md — TrabajoFinalJuegoDT

Instrucciones operativas para el trabajo del agente de IA en este repositorio.

## 1. Alcance y contexto

- Aplicar estas instrucciones al inicio de cada consulta y antes de modificar el proyecto.
- Responder en español.
- Adaptar la profundidad del análisis a la complejidad de la solicitud.
- Preservar el trabajo existente del usuario y los cambios no relacionados con la tarea.
- Proyecto: videojuego 2D top-down de disparos y exploración de laberinto, inspirado en un título de NES, correspondiente al Trabajo Final DT2.
- Documentación general: `docs/`.
- Documento principal de requisitos: `docs/TF DT2 GDD.docx` (GDD del videojuego).
- El archivo `docs/~$ DT2 GDD.docx` es temporal de Word y debe ignorarse; la fuente vigente es `docs/TF DT2 GDD.docx`.
- Stack declarado: Phaser/Web (JavaScript/TypeScript). Si la estructura real del proyecto difiere cuando se agregue código, registrarla en este archivo sin asumirla.
- Recursos gráficos: carpeta `assets/` en la raíz del proyecto, según convención informada por el usuario.
- Recursos gráficos detectados en `assets/` al momento del diagnóstico: `JUGADOR.png`, `ENEMIGO1 ELFO.png`, `ENEMIGO2 ZOMBIE.png`, `FLECHA.png`, `COFRE.png`, `HADA.png`. Esta lista puede cambiar; verificar su disponibilidad antes de referenciarla.
- Repositorio Git: rama base `master`, remoto `origin` (`https://github.com/monprevm/TrabajoFinalJuegoDT.git`).
- En el diagnóstico inicial no se ha detectado código fuente ni scripts de prueba. Existe la carpeta `assets/` con sprites. Las rutas y comandos reales deben verificarse cuando existan; no inventarlos.
- Clasificar el requisito solicitado como: definido, parcialmente definido, no definido, en contradicción o no aplica.
- Diferenciar claramente las reglas documentadas, las propuestas del agente y los supuestos.

## 2. Revisar la documentación y el requisito

Antes de proponer o implementar una solución:

1. Identificar el requisito solicitado y su comportamiento esperado.
2. Revisar la carpeta de documentación del proyecto: `docs/`.
3. Consultar las secciones pertinentes del documento principal:
   - `docs/TF DT2 GDD.docx` (GDD), porque es un videojuego.
   - Si se agregaran documentos equivalentes, registrar su ruta aquí sin asumir su existencia.
4. Clasificar el requisito como:
   - **Definido:** la documentación describe suficientemente el comportamiento.
   - **Parcialmente definido:** está contemplado, pero faltan detalles necesarios.
   - **No definido:** no aparece en la documentación revisada.
   - **En contradicción:** la solicitud difiere de una regla documentada.
   - **No aplica:** es una consulta técnica o documental sin una regla funcional asociada.
5. Citar el documento y la sección que respaldan el análisis.
   - El GDD es un archivo DOCX; en este flujo no se dispone de numeración de páginas impresa. Citarlo por título de sección.
   - Secciones relevantes del GDD: "Alumnos", "Mecánicas", "Controles", "Concepto", "Jugador", "Enemigos", "Objetos en cofres".
   - Ejemplo de cita: `docs/TF DT2 GDD.docx`, sección "Controles".
6. Diferenciar las reglas documentadas de las propuestas y los supuestos.

### Reglas documentadas en el GDD

Según `docs/TF DT2 GDD.docx`, verificar siempre contra el archivo antes de depender de este resumen:

- Movimiento en cuatro direcciones.
- Disparar con click derecho.
- Consumir comida con la tecla C.
- Controles de movimiento: W arriba, S abajo, D derecha, A izquierda.
- Jugador con barra de vida de 3 corazones, que puede aumentar con el objeto necesario.
- Ballesta con munición de 20 flechas que se pueden equipar en un momento y que se puede recargar.
- Enemigos: Elfo (Enemigo 1), muere de un disparo, lento y en grupos; Enemigo 2 - Zombie, mucho más fuerte, muere de cinco disparos y aparece en grupos de 1 a 3; Ogro (Enemigo 3), tipo de jefe que aparece a partir del nivel 3.
- Condición de avance: encontrar 3 llaves dispersas por el nivel.
- El jugador puede saltar paredes del laberinto en ciertas ocasiones; esto solo es posible si en ambas partes de la pared hay un hongo saltarín.
- Cofres con recompensas aleatorias: Tesoro (10 a 100 puntos), Manzana (restaura un corazón de vida), Munición de flechas (máximo 5 por cofre) y Hada (indica la dirección de las llaves restantes; si ya tiene las 3 llaves, indica dónde está la puerta del siguiente nivel).

Si no existe documentación o no puede leerse, indicarlo claramente y no afirmar que el requisito está definido o ausente.

Un requisito no documentado puede ser una ampliación válida: identificarlo como tal y consultar las decisiones necesarias.

No modificar la documentación de requisitos para justificar una implementación sin una solicitud explícita del usuario. Esto incluye `docs/TF DT2 GDD.docx`.

## 3. Analizar conflictos e impacto

Antes de modificar una funcionalidad:

- Revisar tanto las reglas documentadas como la implementación existente.
- Identificar dependencias, restricciones compartidas, excepciones, prioridades entre comportamientos y posibles regresiones.
- Analizar las interacciones con otras funcionalidades.
- Comparar el comportamiento actual con la documentación; no asumir que el código existente es necesariamente correcto.
- Detectar contradicciones internas de la documentación, incluidas diferencias entre texto, diagramas e imágenes.
- Comunicar los conflictos relevantes antes de modificar la parte afectada.

En este proyecto, considerar cuando corresponda:

- Etapas o acciones del juego y qué está permitido en cada una.
- Movimiento del jugador y límites del laberinto.
- Activación de casillas e interacciones encadenadas.
- Poderes, efectos, escudos e inmunidades cuando existan en una futura versión del GDD.
- Inventario, dinero, compras y descuentos cuando existan en una futura versión del GDD.
- Navegación de escenas y condición de victoria o avance de nivel (3 llaves y ubicación de la puerta).
- Controles de PC: W, S, D, A, click derecho para disparar y C para consumir comida.
- Controles de dispositivos móviles: no están definidos en el GDD vigente. No asumir soporte móvil ni inventar controles.

Contradicciones o ambigüedades conocidas para verificar al analizar el GDD:

- La expresión "hongo saltarán" puede ser un error textual; confirmar su significado antes de implementar el salto de paredes.
- Algunas cantidades y condiciones (por ejemplo, carga inicial y recarga de flechas, daño del jugador, salud de enemigos, número de niveles) no están completamente cuantificadas.
- Si se detecta diferencia entre texto, diagramas o imágenes, reportarla antes de implementar.

## 4. Preguntar antes de avanzar ante dudas

Cuando una duda afecte el alcance, las reglas, el comportamiento, la compatibilidad o la implementación:

- Utilizar la herramienta de preguntas del entorno (`question`).
- Formular preguntas concretas.
- Explicar qué decisión falta y por qué importa.
- Ofrecer opciones cuando faciliten la decisión.
- Incluir una recomendación fundamentada cuando corresponda.
- Esperar la respuesta antes de adoptar una decisión que cambie el comportamiento solicitado.
- No inventar reglas para resolver omisiones o contradicciones.
- Continuar con tareas independientes cuyo alcance esté claro.

Si la herramienta de preguntas no está disponible, preguntar directamente en la conversación y esperar la aclaración necesaria.

## 5. Utilizar POO y patrones de diseño

- Modelar las entidades y comportamientos del dominio mediante programación orientada a objetos, respetando Phaser/Web, JavaScript/TypeScript y la arquitectura del proyecto.
- Encapsular el estado y las reglas.
- Mantener responsabilidades claras, alta cohesión y bajo acoplamiento.
- Favorecer composición cuando evite jerarquías de herencia innecesarias.
- Separar la lógica de negocio de la presentación y la entrada del usuario.
- Utilizar patrones de diseño cuando resuelvan una necesidad concreta, por ejemplo State, Strategy, Factory u Observer.
- Explicar brevemente la elección y utilidad de los patrones aplicados.
- Evitar abstracciones innecesarias y refactorizaciones ajenas al requisito.
- No imponer estos patrones cuando no aporten valor.

## 6. Reutilizar código existente

Antes de crear clases, componentes, servicios o utilidades:

1. Buscar implementaciones relacionadas.
2. Revisar sus contratos, comportamiento y consumidores.
3. Priorizar su reutilización o extensión cuando sean compatibles.
4. Evitar duplicar lógica de negocio.
5. Extraer lógica común cuando exista una necesidad real, preservando el comportamiento de sus consumidores.
6. Respetar las convenciones de estructura, nombres y estilo del proyecto.

Si no existe código reutilizable, indicarlo y diseñar una solución coherente con el proyecto.

Repetir esta revisión en cada tarea; no asumir que la estructura permanece igual entre consultas.

## 7. Consultar sobre sprites y recursos gráficos

Cuando una tarea requiera sprites u otros recursos gráficos:

1. Revisar los recursos disponibles en `assets/` y sus convenciones de uso.
2. Utilizar la herramienta de preguntas al usuario antes de implementar la parte visual para confirmar si desea:
   - **Generar un mockup:** una representación provisional para desarrollar y validar la funcionalidad.
   - **Utilizar un recurso existente:** solicitar el nombre exacto del recurso.
3. Si el recurso indicado no puede localizarse, pedir su ruta o el archivo correspondiente.

Además:

- No asumir qué sprite utilizar ni inventar nombres o rutas.
- Si se elige un mockup, aclarar que es provisional y confirmar el alcance visual necesario.
- Si se elige un recurso existente, comprobar su disponibilidad y compatibilidad con el uso previsto.
- Consultar detalles como spritesheet, fotogramas o animaciones cuando sean necesarios y no estén documentados.
- Si falta el archivo, solicitarlo antes de avanzar con la parte que depende de él.
- Continuar con la lógica independiente de los recursos gráficos mientras se resuelve la consulta.
- Recursos gráficos detectados al momento del diagnóstico en `assets/`: `JUGADOR.png`, `ENEMIGO1 ELFO.png`, `ENEMIGO2 ZOMBIE.png`, `FLECHA.png`, `COFRE.png`, `HADA.png`; su uso debe confirmarse antes de implementar.
- No tratar `docs/~$ DT2 GDD.docx` ni archivos temporales como recursos válidos del proyecto.

## 8. Definir y preparar el flujo Git

Antes de implementar:

- Comprobar si el proyecto utiliza Git. Este proyecto sí utiliza Git.
- Revisar el estado del repositorio, la rama actual, los remotos y la estrategia de ramas acordada.
- Base: `master`. Remoto: `origin`.
- Convención acordada: ramas descriptivas creadas desde `master` con prefijos:
  - `feature/<descripcion>`
  - `fix/<descripcion>`
  - `docs/<descripcion>`
  - `refactor/<descripcion>`
- Si no hay una estrategia definida para una tarea particular, consultar la rama base, la convención de nombres y el remoto. No asumir que existe `develop` ni imponer GitFlow completo.
- No implementar directamente sobre `master`.
- Crear una rama de trabajo antes de modificar código, con un nombre descriptivo conforme a la convención.
- Si ya existe una rama apropiada para la tarea, verificar si corresponde continuar en ella.

Si existen cambios previos del usuario:

- Preservarlos.
- Identificar si interfieren con la tarea.
- Consultar antes de realizar operaciones que puedan moverlos, descartarlos o mezclarlos.

Si el proyecto no tiene repositorio Git o remoto configurado, informar la situación y consultar antes de inicializarlo o configurarlo. Esto no aplica actualmente, pero debe verificarse en cada tarea.

## 9. Implementar y verificar

- Definir criterios de aceptación a partir del requisito, la documentación y las aclaraciones del usuario.
- Realizar cambios enfocados en el alcance acordado.
- Ejecutar las comprobaciones disponibles y pertinentes al cambio.
- Verificar las interacciones identificadas durante el análisis de impacto.
- Agregar pruebas cuando aporten valor para validar reglas o prevenir regresiones.
- Evitar pruebas que solo repliquen la implementación.
- Informar qué se verificó y qué quedó pendiente.
- No afirmar resultados que no fueron comprobados.

En el estado inicial del proyecto no se han documentado comandos de prueba ni herramientas de verificación. Antes de verificar, identificar los scripts o comandos disponibles en la configuración real del proyecto. No asumir `npm test`, `npm run build` ni equivalentes sin confirmarlos.

## 10. Solicitar confirmación y realizar commit y push

Cuando termine la implementación:

1. Presentar al usuario:
   - Resumen del comportamiento implementado.
   - Archivos afectados.
   - Verificaciones realizadas y sus resultados.
   - Pendientes o limitaciones reales.
   - Rama de trabajo utilizada.
2. Utilizar la herramienta de preguntas para solicitar:
   - Confirmación de que la implementación es aceptada.
   - Autorización explícita para realizar commit y push.
3. Esperar la respuesta.
4. Si el usuario solicita ajustes:
   - Realizarlos.
   - Repetir las verificaciones afectadas.
   - Volver a solicitar confirmación.

Después de recibir autorización:

1. Revisar `git status`, `git diff` y `git log --oneline -10`.
2. Revisar los archivos nuevos que se incluirán.
3. Preparar únicamente los cambios correspondientes a la tarea, sin incluir cambios ajenos ni secretos.
4. Crear un commit descriptivo, coherente con las convenciones del repositorio.
5. Realizar push de la rama al remoto acordado, configurando su seguimiento cuando corresponda.
6. Informar:
   - Nombre de la rama.
   - Identificador y mensaje del commit.
   - Resultado del push.

No realizar commit ni push sin autorización explícita del usuario.

No hacer force push, omitir hooks, modificar la configuración de Git ni fusionar ramas sin una solicitud expresa.

Si un hook o comprobación falla, resolver el problema antes de continuar. Si commit o push falla, informar el resultado sin afirmar que la operación se completó.

La creación de un pull request y la integración en la rama base requieren autorización adicional.

## 11. Comunicar el análisis y los resultados

Antes de implementar, presentar un análisis breve con los puntos pertinentes:

### Análisis previo

- **Requisito:** comportamiento solicitado.
- **Documentación:** estado y referencias.
- **Conflictos e impacto:** funcionalidades y reglas afectadas.
- **Reutilización:** código existente aprovechable.
- **Diseño:** enfoque POO y patrones pertinentes.
- **Recursos gráficos:** recursos confirmados o consulta pendiente.
- **Git:** rama base y rama de trabajo.
- **Dudas:** decisiones que requieren respuesta del usuario.

Para consultas simples, reducir el formato a los puntos aplicables.

Al finalizar, resumir:

- Cambios y archivos afectados.
- Decisiones relevantes.
- Verificaciones ejecutadas.
- Pendientes reales.
- Confirmación solicitada al usuario.
- Resultado de commit y push, únicamente si fueron autorizados y ejecutados.

No presentar propuestas como funcionalidades implementadas.

## 12. Estructura y comandos del proyecto (Nivel 1)

Estructura real implementada (JavaScript + Phaser 3 + Vite):

- `index.html`, `vite.config.js`, `package.json` con scripts `dev`, `build` y `preview`.
- `src/main.js`: configuración del juego Phaser y registro de escenas.
- `src/config.js`: parámetros del nivel (semilla, tamaño del laberinto, jugador, enemigos, cantidades). Las cantidades que el GDD no define se centralizan acá como supuestos configurables.
- `src/scenes/`: `BootScene`, `GameScene`, `HUDScene`, `GameOverScene`, `LevelClearScene`.
- `src/entities/`: `Player`, `Enemy` (base), `Elf`, `Zombie`, `Arrow`, `KeyItem`, `Chest`, `Door`.
- `src/systems/`: `MazeGenerator` (backtracker con semilla), `LevelLayout` (colocación de llaves, cofres, puerta y grupos de enemigos), `RewardFactory`, `Random` (mulberry32).
- `assets/`: se importan desde `BootScene`. Los recursos faltantes (pared, piso, llave, puerta, corazones) son mockups generados por código y deben reemplazarse cuando existan los definitivos.
- `.gitignore`: excluye `node_modules/`, `dist/` y archivos temporales/logs.

Comandos verificados en este proyecto: `npm install`, `npm run build` (vite build) y `npm run dev` (servidor en `http://localhost:5173`). No hay linter ni framework de tests configurado.

## Flujo esperado para futuras implementaciones

revisar documentación → analizar impacto → aclarar dudas →
confirmar recursos gráficos cuando corresponda → definir y crear rama →
diseñar y reutilizar → implementar → verificar →
solicitar confirmación → commit → push.
