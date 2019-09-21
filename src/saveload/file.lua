local ABILITY_LIST = {
    FourCC('Amls'),
    FourCC('Aroc'),
    FourCC('Amic'),
    FourCC('Amil'),
    FourCC('Aclf'),
    FourCC('Acmg'),
    FourCC('Adef'),
    FourCC('Adis'),
    FourCC('Afbt'),
    FourCC('Afbk'),
}

function writeFile(file, contents)
    local c = 0
    local len = StringLength(contents)
    local chunk

    -- Begin to generate the file
    PreloadGenClear()
    PreloadGenStart()
    for i=0,len-1,200 do
        chunk = SubString(contents, i, i + 200)
        Preload("\" )\ncall BlzSetAbilityIcon(" .. I2S(ABILITY_LIST[c + 1]) .. ", \"" .. chunk .. "\")\n//")
        c = c + 1
    end
    Preload("\" )\nendfunction\nfunction a takes nothing returns nothing\n //")
    PreloadGenEnd(file)
end

function readFile(file)
    local original = {}
    local output= ""

    for i=0,#ABILITY_LIST-1,1 do
        original[i + 1] = BlzGetAbilityIcon(ABILITY_LIST[i + 1])
    end

    -- Execute the preload file
    Preloader(file)

    for i=0,#ABILITY_LIST-1,1 do
        chunk = BlzGetAbilityIcon(ABILITY_LIST[i + 1])
        if chunk == original[i + 1] then
            return output
        end

        output = output .. chunk

        BlzSetAbilityIcon(ABILITY_LIST[i + 1], original[i + 1])
    end

    return output
end


return {
    writeFile = writeFile,
    readFile = readFile,
}
