import dataset, {
  manifest,
  sample001,
  type DatasetManifest,
  type SimpleRouteJson,
} from "../index.js"

const typedSample: SimpleRouteJson = sample001
const typedManifest: DatasetManifest = manifest
const typedDataset: Record<string, SimpleRouteJson> = dataset

void typedSample
void typedManifest
void typedDataset
