import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';

describe('D&D Combat API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com';

  p.request.setDefaultTimeout(90000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  describe('Validações de Personagem', () => {
    it('Valida personagem com dados corretos', async () => {
      const character = {
        name: "Kaya",
        strength: 10,
        dexterity: 7,
        hitPoints: 11,
        armorClass: 12
      };

      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson(character)
        .expectStatus(StatusCodes.OK)
    });
    it('Valida personagem com dados incompletos', async () => {
      const character = {
        name: "Kaya",
        strength: 10,
        dexterity: 7
      };

      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson(character)
        .expectStatus(StatusCodes.BAD_REQUEST)
    });

    it('Valida personagem com dados negativos', async () => {
      const character = {
        name: "Kaya",
        strength: -1,
        dexterity: 7,
        hitPoints: 11,
        armorClass: 12
      };

      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson(character)
        .expectStatus(StatusCodes.BAD_REQUEST)
    });
  });

  describe('Monstros', () => {
    it('Retorna lista de monstros', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'string'
          }
      });
  });
  
    // feito
    it('Retorna detalhes de um monstro', async () => {
      const monsterName = 'goblin';
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${monsterName}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            name: { type: 'string' },
            strength: { type: 'number' },
            dexterity: { type: 'number' },
            hit_points: { type: 'number' },
            armor_class: { type: 'number' },
          },
          required: ['name', 'strength', 'dexterity', 'hit_points', 'armor_class']
        });
    });

    it('Retorna 500 para monstro inexistente', async () => {
      const monsterName = 'UnknownMonster';
      
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${monsterName}`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    });
  });

  describe('Batalhas', () => {
    it('Simula batalha com sucesso', async () => {
      const character = {
        name: "Kaya",
        strength: 10,
        dexterity: 7,
        hitPoints: 11,
        armorClass: 12
      };
      const monsterName = 'goblin';

      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson(character)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('winner')
        .expectJsonSchema({
          type: 'object',
          properties: {
            winner: { type: 'string' },
            rounds: { type: 'number' }
          },
          required: ['winner', 'rounds']
        });
    });

    it('Simula batalha com personagem inválido', async () => {
      const character = {
        name: "Kaya",
        strength: -10,
        dexterity: 7,
        hitPoints: 11,
        armorClass: 12
      };
      const monsterName = 'Goblin';

      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson(character)
        .expectStatus(StatusCodes.BAD_REQUEST)
    });

    it('Simula batalha com monstro inexistente', async () => {
      const character = {
        name: "Kaya",
        strength: 10,
        dexterity: 7,
        hitPoints: 11,
        armorClass: 12
      };
      const monsterName = 'UnknownMonster';

      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson(character)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    });
  });

  describe('Exemplo de Personagem', () => {
    it('Retorna template de personagem', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/characters/example`)
        .expectStatus(StatusCodes.OK)
        .expectJson({
          name: 'Kaya',
          strength: 10,
          dexterity: 7,
          hitPoints: 11,
          armorClass: 12
        });
    });
  });

  afterAll(() => p.reporter.end());
});
