//Angle functions to calculate how fast each clock hand shoul move throughout the clock
//Hour posistion angle to calculate hvwere ech number shoulde me placed.

function calculateHourAngle(
  hour: number,
  minutes: number,
  seconds: number,
): number {
  let hourAngle = (hour % 12) * 30 + minutes * 0.5 + (0.5 / 60) * seconds;

  return hourAngle;
}

function calculateMinutesAngle(minutes: number): number {
  let minutesAngle = minutes * 6;

  return minutesAngle;
}

function calculateSecondsAngle(seconds: number, milliseconds: number): number {
  const secondsAndgle = seconds * 6 + milliseconds * (6 / 1000);

  return secondsAndgle;
}

function calculateHourPosition(
  hour: number,
  minutes: number,
  radius: number,
  width: number,
  height: number,
) {
  let angle = (hour % 12) * 30 + minutes * 0.5;

  const radians = (angle * Math.PI) / 180;

  let centerX = width / 2;
  let centerY = height / 2;

  const x = centerX + radius * Math.sin(radians);
  const y = centerY - radius * Math.cos(radians);

  return { x, y };
}

export { calculateHourAngle };
export { calculateSecondsAngle };
export { calculateMinutesAngle };
export { calculateHourPosition };
