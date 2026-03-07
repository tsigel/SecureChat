import { appD } from '@/model/app';
import { initialize } from '@/bus/runtime/service';

const initSwFx = appD.createEffect(initialize);
