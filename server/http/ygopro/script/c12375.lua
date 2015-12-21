--Defense Wall
function c12375.initial_effect(c)
	--atk limit
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetRange(LOCATION_MZONE)
	e4:SetTargetRange(LOCATION_MZONE,0)
	e4:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
	e4:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e4:SetCondition(c12375.atcon)
	e4:SetTarget(c12375.atlimit)
	e4:SetValue(1)
	c:RegisterEffect(e4)
end

function c12375.atcon(e)
	return e:GetHandler():IsDefencePos()
end
function c12375.atlimit(e,c)
	return c~=e:GetHandler()
end
