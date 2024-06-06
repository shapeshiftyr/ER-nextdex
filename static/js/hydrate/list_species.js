import { compareData, gameData } from "../data_version.js";
import { StatsEnum, currentSpecieID, feedPanelSpecies, getColorOfStat, getSpritesURL } from "../panels/species/species_panel.js";
import { JSHAC, e } from "../utils.js";


export function toggleLayoutList(toggle= true){
    if (toggle){
        $('#panel-list-species').show()
        $('#panel-block-species').hide()
    } else {
        $('#panel-list-species').hide()
        $('#panel-block-species').show()
    }
}


export function hydrateSpeciesList(){
    const species = gameData.species
    const speciesLen = species.length
    const fragment = document.createDocumentFragment();
    for (let specieID = 0; specieID < speciesLen; specieID++) {
        if (specieID == 0) continue // skip specie none
        const specie = species[specieID]
        const nameRow = e('div', 'list-species-name')
        /*row.setAttribute('draggable', true);
        row.ondragstart = (ev) => {
            ev.dataTransfer.setData("id", i)
        }*/
        //Node id because for correlation with nodelist in sorting
        /*specie.nodeID = nodeLists.species.length
        nodeLists.species.push(row)*/

        const image = e('img', 'species-list-sprite list-species-sprite')
        image.src = getSpritesURL(specie.NAME)
        image.alt = specie.name
        image.loading = "lazy"
        nameRow.appendChild(image)
        
        const name = e('span', "species-name span-a", specie.name)
        nameRow.append(name)

        fragment.append(JSHAC([
            e('div', 'list-species-row'), [
                nameRow,
                e('div', 'list-species-abis-block', [...new Set(specie.stats.abis)].filter(x => x).map(x => {
                    return e('div', 'list-species-abi', [e('span', null, gameData.abilities[x].name)])
                })),
                e('div', 'list-species-inns-block', [...new Set(specie.stats.inns)].filter(x => x).map(x => {
                    return e('div', 'list-species-inn', [e('span', null, gameData.abilities[x].name)])
                })),
                e('div', 'list-species-types-block', [...new Set(specie.stats.types)].map(x => {
                    const type = gameData.typeT[x]
                    return e('div', `list-species-type type ${type.toLowerCase()}`, [e('span', null, type)])
                })),
                e('div', 'list-species-basestats-block', StatsEnum.concat(["BST"]).map((x, i) => {
                    const statValue = specie.stats.base[i]
                    const color = getColorOfStat(statValue, i)
                    const statNode = e('span', null, statValue)
                    $(statNode).css('background-color', color)
                    const comp = compareData?.species?.[specieID].stats?.base[i]
                    if (comp){
                        return JSHAC([
                            e('div', 'list-species-basestats-col', [
                                e('div', 'list-species-basestats-head', x),
                                e('div', 'list-species-basestats-val', [
                                    e('span','crossed', comp),
                                    e('br', null, '→'),
                                    statNode,
                                ])
                            ])
                        ])
                    } else {
                        return JSHAC([
                            e('div', 'list-species-basestats-col', [
                                e('div', 'list-species-basestats-head', x),
                                e('div', 'list-species-basestats-val', [
                                    statNode,
                                ])
                            ])
                        ])
                    }
                    
                })),
                e('div', 'list-species-btn-view', [e('span', null, 'View')], {
                    onclick: (ev)=>{
                        $('#species-return-list-layout').show()
                        feedPanelSpecies(specieID)
                        toggleLayoutList(false)
                    }
                })
            ]
        ]))
    }
    $('#panel-list-species').empty().append(fragment)
}