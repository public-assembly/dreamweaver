import { PrismaClient } from "@prisma/client";
import { APLogs, Transactions} from "./interfaces/transactionInterfaces";

const prisma = new PrismaClient();

export async function processCleanedLogs(transactions: Transactions, cleanedLogs: APLogs[]) {
    console.log('Processing cleaned logs...'); // Debugging line
    for (const edge of transactions.edges) {
        for (const log of cleanedLogs) {
            if (!log.args) {
                console.log(`Skipping log due to missing args: ${JSON.stringify(log)}`);
                continue;
            }
            switch (log.eventName) {
                case 'Create721Press':
                    if (edge.node.id && log.args.newPress && log.args.initialOwner && log.args.initialLogic && log.args.creator && log.args.initialRenderer && typeof log.args.soulbound !== 'undefined') {
                        const createPressEvent = {
                            data: {
                                id: edge.node.id,
                                newPress: log.args.newPress,
                                initialOwner: log.args.initialOwner,
                                initialLogic: log.args.initialLogic,
                                creator: log.args.creator,
                                initialRenderer: log.args.initialRenderer,
                                soulbound: log.args.soulbound,
                                address: log.address,
                                eventType: log.eventName,
                            }
                        }; 
                        await prisma.createPress721.create(createPressEvent);
                    } else {
                        console.log('Skipping Create721Press event due to missing args');
                    }
                    break;
                case 'RendererUpdated':
                    if (edge.node.id && log.args.targetPress && log.args.renderer) {
                        const rendererEvent = {
                            data: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                renderer: log.args.renderer,
                            }
                        }; 
                        await prisma.rendererUpdated.create(rendererEvent);
                    } else {
                        console.log('Skipping RendererUpdated event due to missing args');
                    }
                    break;
                case 'DataStored':
                    if (edge.node.id && log.args.targetPress && log.args.storeCaller && log.args.tokenId && log.args.pointer) {
                        const dataStoredEvent = {
                            data: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                storeCaller: log.args.storeCaller,
                                tokenId: log.args.tokenId,
                                pointer: log.args.pointer
                            }
                        }; 
                        await prisma.dataStored.create(dataStoredEvent);
                    } else {
                        console.log('Skipping DataStored event due to missing args');
                    }
                    break;
                case 'LogicUpdated':
                    if (edge.node.id && log.args.targetPress && log.args.logic) {
                        const logicEvent = {
                            data: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                logic: log.args.logic,
                            }
                        }; 
                        await prisma.logicUpdated.create(logicEvent);
                    } else {
                        console.log('Skipping LogicUpdated event due to missing args');
                    }
                    break;
                case 'PressInitialized':
                    if (edge.node.id && log.args.targetPress && log.args.sender) {
                        const pressEvent =  {
                            data: {
                                id: edge.node.id,
                                targetPress: log.args.targetPress,
                                sender: log.args.sender,
                            }
                        };
                        await prisma.pressInitialized.create(pressEvent);
                    } else {
                        console.log('Skipping PressInitialized event due to missing args');
                    }
                    break;
                default:
                    console.log(`Unknown event type: ${log.eventName}`);
            }
        }
    }
}
