--捨て猫娘
function c100000171.initial_effect(c)
	--battle indestructable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetCondition(c100000171.con)
	e1:SetValue(1)
	c:RegisterEffect(e1)
end
function c100000171.con(e,c)
	return e:GetHandler():IsAttackPos() 
end