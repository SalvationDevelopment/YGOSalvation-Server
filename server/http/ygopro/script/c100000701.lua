--ダークネス・ブランブル
function c100000701.initial_effect(c)
	--lp4000
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetProperty(EFFECT_FLAG_REPEAT)
	e1:SetCountLimit(1)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c100000701.condition)
	e1:SetOperation(c100000701.operation)
	c:RegisterEffect(e1)
	--battle indestructable
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(1)
	c:RegisterEffect(e2)
end
function c100000701.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetLP(tp)<4000
end
function c100000701.operation(e,tp,eg,ep,ev,re,r,rp)
	local p=e:GetHandler():GetControler()
	Duel.SetLP(tp,4000,REASON_EFFECT)
end


