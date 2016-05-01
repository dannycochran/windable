export const canvas = {
  prepare: function(context, particleWidth, particleFadeOpacity) {
    context.lineWidth = particleWidth;
    context.fillStyle = `rgba(0, 0, 0, ${particleFadeOpacity})`;
  },

  draw: function(buckets, bounds, context, colorScheme) {
    // Fade existing particle trails.
    const prev = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-in";
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.globalCompositeOperation = prev;

    // Draw new particle trails.
    buckets.forEach((bucket, i) => {
      if (bucket.length > 0) {
        context.beginPath();
        context.strokeStyle = colorScheme[i];

        bucket.forEach((particle) => {
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.xt, particle.yt);
          particle.x = particle.xt;
          particle.y = particle.yt;
        });

        context.stroke();
      }
    });
  },

  clear: function(context, bounds) {
    context.clearRect(0, 0, bounds.width, bounds.height);

    if (context.resetTransform) {
      context.resetTransform();
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
}