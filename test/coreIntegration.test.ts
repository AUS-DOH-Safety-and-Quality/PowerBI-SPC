import { capabilitiesSuite, formattingContractsSuite } from "powerbi-visuals-core/testing";
import settingsModel, { defaultSettings } from "../src/settings";
import capabilities from "../capabilities.json";

formattingContractsSuite(settingsModel, defaultSettings);
capabilitiesSuite(settingsModel, capabilities, ["split_indexes_storage"]);
