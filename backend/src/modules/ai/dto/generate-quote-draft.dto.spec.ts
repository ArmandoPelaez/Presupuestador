import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GenerateQuoteDraftDto } from './generate-quote-draft.dto';
import { AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH } from '../quote-draft.constants';

describe('GenerateQuoteDraftDto', () => {
  it('normaliza y acepta una descripcion valida', async () => {
    const dto = plainToInstance(GenerateQuoteDraftDto, {
      description: '  Presupuesto para instalar tres camaras  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.description).toBe('Presupuesto para instalar tres camaras');
  });

  it('rechaza descripcion corta o demasiado larga antes de llamar a IA', async () => {
    const shortDto = plainToInstance(GenerateQuoteDraftDto, {
      description: 'corto',
    });
    const longDto = plainToInstance(GenerateQuoteDraftDto, {
      description: 'x'.repeat(AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH + 1),
    });

    await expect(validate(shortDto)).resolves.not.toHaveLength(0);
    await expect(validate(longDto)).resolves.not.toHaveLength(0);
  });
});
