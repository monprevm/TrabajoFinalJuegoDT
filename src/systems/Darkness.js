const LIGHT_TEXTURE_KEY = 'light-gradient';
const LIGHT_TEXTURE_SIZE = 256;

// Oscurece todo el nivel y recorta un halo circular de luz centrado en el jugador.
// La capa vive en coordenadas de mundo, por lo que respeta el scroll y el zoom de la cámara.
export class Darkness {
  #scene;
  #radius;
  #coreRatio;
  #opacity;
  #color;
  #overlay;
  #light;

  constructor(scene, { radius, coreRatio, opacity, color, width, height }) {
    this.#scene = scene;
    this.#radius = radius;
    this.#coreRatio = coreRatio;
    this.#opacity = opacity;
    this.#color = color;

    this.#ensureLightTexture();

    this.#overlay = scene.add
      .renderTexture(0, 0, width, height)
      .setOrigin(0, 0)
      .setDepth(50);

    this.#light = scene.make
      .image({ x: 0, y: 0, key: LIGHT_TEXTURE_KEY, add: false })
      .setOrigin(0.5)
      .setScale((radius * 2) / LIGHT_TEXTURE_SIZE);

    scene.events.once('shutdown', () => this.destroy());
  }

  #ensureLightTexture() {
    if (this.#scene.textures.exists(LIGHT_TEXTURE_KEY)) return;

    const texture = this.#scene.textures.createCanvas(
      LIGHT_TEXTURE_KEY,
      LIGHT_TEXTURE_SIZE,
      LIGHT_TEXTURE_SIZE,
    );
    if (!texture) return;
    const context = texture.context;
    if (!context) return;

    const center = LIGHT_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(this.#coreRatio, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, LIGHT_TEXTURE_SIZE, LIGHT_TEXTURE_SIZE);
    texture.refresh();
  }

  update(player) {
    if (!player || !this.#overlay) return;

    this.#overlay.clear();
    this.#overlay.fill(this.#color, this.#opacity);
    this.#overlay.erase(this.#light, player.x, player.y);
  }

  destroy() {
    if (this.#overlay) {
      this.#overlay.destroy();
      this.#overlay = null;
    }
    if (this.#light) {
      this.#light.destroy();
      this.#light = null;
    }
  }
}
