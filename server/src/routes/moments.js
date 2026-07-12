import { Router } from 'express';
import { getCurator } from '../services/bootstrap.js';
import {
  feedFor,
  geojsonFor,
  passportFor,
  momentById,
} from '../services/momentQueries.js';

const router = Router();

// The bare /api/moments endpoints represent the curator's brand home ("/").
async function curatorId() {
  const c = await getCurator();
  return c?._id;
}

router.get('/', async (req, res) => res.json(await feedFor(await curatorId())));

router.get('/geojson', async (req, res) => res.json(await geojsonFor(await curatorId())));

router.get('/passport', async (req, res) => res.json(await passportFor(await curatorId())));

router.get('/:id', async (req, res) => {
  const moment = await momentById(req.params.id);
  if (!moment) return res.status(404).json({ error: 'Moment not found' });
  res.json(moment);
});

export default router;
