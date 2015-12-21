--ニードル·ギルマン
function c1059.initial_effect(c)
	--atk up
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetTarget(c1059.atktg)
	e1:SetValue(400)
	c:RegisterEffect(e1)
end
function c1059.atktg(e,c)
	return true
end
