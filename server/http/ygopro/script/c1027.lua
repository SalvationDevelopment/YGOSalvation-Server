--勝利の導き手フレイヤ
function c1027.initial_effect(c)
	--atk def
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetTarget(c1027.tg)
	e1:SetValue(400)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_UPDATE_DEFENCE)
	c:RegisterEffect(e2)
	--cannot be battle target
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e1:SetCondition(c1027.con)
	e1:SetValue(1)
	c:RegisterEffect(e1)
end
function c1027.tg(e,c)
	return true
end
function c1027.filter(c)
	return c:IsFaceup() and not c:IsCode(1027)
end
function c1027.con(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c1027.filter,c:GetControler(),LOCATION_MZONE,0,1,c)
end
