--奇跡のピラミッド
function c1168.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--atk up
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetTarget(aux.TargetBoolFunction(Card.IsType,TYPE_MONSTER))
	e2:SetValue(c1168.val)
	c:RegisterEffect(e2)
	--destroy replace
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_DESTROY_REPLACE)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCountLimit(1)
	e3:SetTarget(c1168.destg)
	e3:SetValue(1)
	e3:SetOperation(c1168.desop)
	c:RegisterEffect(e3)
end
function c1168.val(e,c)
	return Duel.GetFieldGroupCount(e:GetHandlerPlayer(),0,LOCATION_MZONE)*200
end
function c1168.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local tc=eg:GetFirst()
		return eg:GetCount()==1 and tc:IsLocation(LOCATION_MZONE) and tc:IsControler(tp) and tc:IsFaceup()
	end
	return Duel.SelectYesNo(tp,aux.Stringid(1168,0))
end
function c1168.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.SendtoGrave(e:GetHandler(),REASON_EFFECT)
end
