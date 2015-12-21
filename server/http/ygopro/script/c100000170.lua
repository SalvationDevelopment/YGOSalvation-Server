--捨て猫
function c100000170.initial_effect(c)
	--target
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetTarget(c100000170.tg)
	e1:SetValue(1)
	c:RegisterEffect(e1)
end
function c100000170.tg(e,c)
	return c~=e:GetHandler() 
end