import { Scene } from 'three';
import EntityManager from './entities/EntityManager';
import Stats from './Stats';
import Ui from './Ui';

const scene = new Scene();
const entityManager = new EntityManager();
const ui = new Ui();
const stats = new Stats();

export { scene, entityManager, stats, ui };
