import { Router, Server } from '../core';
import zod from '../zod';
import express from 'express';
import generateSpec from './generator';

describe('generator', () => {
  const server = new Server();

  const router = new Router();

  const PetSchema = zod.object({
    id: zod.number(),
    name: zod.string(),
  });

  router.get(
    '/v1/pets',
    {
      query: zod.object({ name: zod.string() }),
      responses: {
        200: {
          description: 'Returns all pets',
          applicationJson: PetSchema,
        },
      },
    },
    [],
    (req, res) => {
      res.status(200).json({ id: 1, name: 'Sabo' });
    },
  );

  router.get(
    '/v1/pets/:id',
    {
      params: zod.object({ id: zod.string() }),
      responses: {
        200: {
          description: 'Returns a pet',
          applicationJson: PetSchema,
        },
        404: {
          description: 'Pet not found',
          applicationJson: zod.object({
            status: zod.number(),
            message: zod.string(),
          }),
        },
      },
    },
    [],
    (req, res) => {
      res.status(400).json({ status: 400, message: 'not found' });
    },
  );

  router.post(
    '/v1/pets/',
    {
      operationId: 'Create a pet',
      body: { applicationJson: PetSchema },
      responses: {
        200: {
          description: 'Returns a pet',
          applicationJson: PetSchema,
        },
        400: {
          description: 'Bad request',
          applicationJson: zod.object({
            status: zod.number(),
            message: zod.string(),
          }),
        },
      },
    },
    [],
    (req, res) => {
      res.status(200).json({ id: 1, name: 'Sabo' });
    },
  );

  router.put(
    '/v1/pets/:id/',
    {
      params: zod.object({ id: zod.string() }),
      body: { applicationJson: PetSchema },

      responses: {
        200: {
          description: 'Updated pet',
          applicationJson: PetSchema,
        },
        400: {
          description: 'Bad request',
          applicationJson: zod.object({
            status: zod.number(),
            message: zod.string(),
          }),
        },
      },
    },
    [],
    (req, res) => {
      res.status(200).json({ id: 1, name: 'Sabo' });
    },
  );

  router.delete(
    'v1/pets/:id',
    {
      params: zod.object({ id: zod.string() }),
      headers: zod.object({ Authorization: zod.string() }),
      responses: {
        201: {
          description: 'Deleted pet',
          applicationJson: PetSchema,
        },
      },
    },
    [],
    (req, res) => {
      res.status(201).json({ id: 1, name: 'Sabo' });
    },
  );

  router.post(
    'v1/pets/multipart',
    {
      body: { multipartFormData: zod.object({ id: zod.string() }) },
      responses: {
        201: {
          description: 'Post multipart pet',
          applicationJson: PetSchema,
        },
      },
    },
    [],
    (req, res) => {
      res.status(201).send({ id: 1, name: 'Sabo' });
    },
  );

  router.get(
    'v1/pets/content-type',
    {
      responses: {
        200: {
          description: 'get pets in different content type',
          applicationJson: PetSchema,
        },
        400: {
          description: 'get pets in different content type',
          textPlain: zod.string(),
          applicationJson: PetSchema,
          textHtml: zod.string(),
        },
      },
    },
    [],
    (req, res) => {
      res.status(200).send('sabo');
    },
  );

  server.useRouters(router);

  it('should generate specification', () => {
    const title = 'Pet store';
    const version = '1.0.0';

    const spec = generateSpec({
      schema: {
        info: {
          title,
          version,
        },
      },
      server,
    });
    expect(spec.info.title).toBe(title);
    expect(spec.info.version).toBe(version);
    expect(spec.paths).toHaveProperty('/v1/pets');
    expect(spec.paths).toHaveProperty('/v1/pets/{id}');

    // v1/pets
    const parameter = spec.paths!['/v1/pets']['get']!['parameters']![0];
    expect(parameter).toHaveProperty('in', 'query');
    expect(parameter).toHaveProperty('name', 'name');
    expect(parameter).toHaveProperty('schema', { type: 'string' });
    expect(parameter).toHaveProperty('required', true);
  });
});
