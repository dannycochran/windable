import {Renderer} from './../renderer';

export class CanvasRenderer extends Renderer {
  prepare_() {
    this.context.lineWidth = this.config_.particleWidth;
    this.context.fillStyle = `rgba(0, 0, 0, ${this.config_.particleFadeOpacity})`;

    return this;
  }

  draw_(buckets, bounds) {
    // Fade existing particle trails.
    const prev = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = "destination-in";
    this.context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.context.globalCompositeOperation = prev;

    // Draw new particle trails.
    buckets.forEach((bucket, i) => {
      if (bucket.length > 0) {
        this.context.beginPath();
        this.context.strokeStyle = this.config_.colorScheme[i];

        bucket.forEach((particle) => {
          this.context.moveTo(particle.x, particle.y);
          this.context.lineTo(particle.xt, particle.yt);
          particle.x = particle.xt;
          particle.y = particle.yt;
        });

        this.context.stroke();
      }
    });

    return this;
  }

  clear_() {
    super.clear_();
    if (!this.mapBounds_) return;

    this.context.clearRect(0, 0, this.mapBounds_.width, this.mapBounds_.height);

    if (this.context.resetTransform) {
      this.context.resetTransform();
    } else {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    return this;
  }
};