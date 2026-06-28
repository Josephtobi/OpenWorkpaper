import { Prisma } from '@prisma/client';
import type { RiskRating } from '@prisma/client';

export interface SamplingInputs {
  populationValue: number;
  performanceMateriality: number;
  riskRating: RiskRating;
  reliabilityFactor?: number;
}

export function riskReliabilityFactor(riskRating: RiskRating): number {
  if (riskRating === 'HIGH') return 2.5;
  if (riskRating === 'MEDIUM') return 1.75;
  return 1.2;
}

export function deriveSampleSize(inputs: SamplingInputs): number {
  const population = Math.max(0, inputs.populationValue);
  const perfMat = Math.max(1, inputs.performanceMateriality);
  const factor = inputs.reliabilityFactor ?? riskReliabilityFactor(inputs.riskRating);

  const suggested = Math.ceil((population / perfMat) * factor);
  return Math.max(5, suggested);
}

export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(Number.isFinite(value) ? value : 0);
}
