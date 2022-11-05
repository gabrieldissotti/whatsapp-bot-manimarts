/**
 * EXEMPLE:
 * input:     [ a, b, c]
 * output:    { a: 'a', b: 'b', c: 'c' }
 */
export default function arrayToEnum(list){
    return list.map(value => ({ [value]: value }))
}