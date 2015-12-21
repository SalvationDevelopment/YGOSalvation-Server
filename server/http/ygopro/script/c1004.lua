--アーマード·フライ
function c1004.initial_effect(c)
	--atk def
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_SET_ATTACK)
	e1:SetValue(1000)
	e1:SetCondition(c1004.con)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_SET_DEFENCE)
	c:RegisterEffect(e2)
end
function c1004.filter(c)
	return c:IsFaceup()
end
function c1004.con(e)
	local c=e:GetHandler()
	return not Duel.IsExistingMatchingCard(c1004.filter,c:GetControler(),LOCATION_MZONE,0,1,c)
end
