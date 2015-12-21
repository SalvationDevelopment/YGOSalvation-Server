--魔導騎士 ディフェンダー
function c1054.initial_effect(c)
	c:EnableCounterPermit(0x3001)
	c:SetCounterLimit(0x3001,1)
	--summon success
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1054,0))
	e1:SetCategory(CATEGORY_COUNTER)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c1054.addct)
	e1:SetOperation(c1054.addc)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c1054.destg)
	e2:SetValue(c1054.value)
	e2:SetOperation(c1054.desop)
	c:RegisterEffect(e2)
end
function c1054.addct(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_COUNTER,nil,1,0,0x3001)
end
function c1054.addc(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToEffect(e) then
		e:GetHandler():AddCounter(0x3001,1)
	end
end
function c1054.dfilter(c)
	return c:IsLocation(LOCATION_MZONE) and c:IsFaceup()
end
function c1054.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local count=eg:FilterCount(c1054.dfilter,nil)
		e:SetLabel(count)
		return count>0 and Duel.IsCanRemoveCounter(tp,1,0,0x3001,count,REASON_COST)
	end
	return Duel.SelectYesNo(tp,aux.Stringid(1054,1))
end
function c1054.value(e,c)
	return c:IsFaceup() and c:GetLocation()==LOCATION_MZONE
end
function c1054.desop(e,tp,eg,ep,ev,re,r,rp)
	local count=e:GetLabel()
	Duel.RemoveCounter(tp,1,0,0x3001,count,REASON_COST)
end
