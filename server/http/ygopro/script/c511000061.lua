--Gjallarhorn
function c511000061.initial_effect(c)
	--
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetRange(LOCATION_SZONE)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetCountLimit(1)
	e1:SetLabel(0)
	e1:SetOperation(c511000061.tgop)
	c:RegisterEffect(e1)
	--Return
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetTarget(c511000061.rtg)
	e2:SetOperation(c511000061.rop)
	e2:SetLabelObject(e1)
	c:RegisterEffect(e2)
end
function c511000061.rfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x4B)
end
function c511000061.rtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local c=e:GetHandler()
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c511000061.rfilter(chkc) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0 and Duel.IsExistingTarget(c511000061.rfilter,tp,LOCATION_MZONE,0,1,nil) end
	e:SetType(EFFECT_TYPE_ACTIVATE)
	Duel.MoveToField(c,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c511000061.rfilter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c511000061.rop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EFFECT_IMMUNE_EFFECT)
		e3:SetValue(c511000061.efilter)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e3)
	end
	e:GetLabelObject():SetLabel(0)
end
function c511000061.efilter(e,te)
	return te:IsActiveType(TYPE_SPELL+TYPE_TRAP)
end
function c511000061.tgop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if Duel.GetTurnPlayer()~=tp then return end
	local ct=e:GetLabel()
	ct=ct+1
	c:SetTurnCounter(ct)
	e:SetLabel(ct)
	if ct==3 then
		local g=Duel.GetMatchingGroup(Card.IsAbleToRemove,tp,LOCATION_MZONE,0,nil)
		local sum=g:GetSum(Card.GetAttack)
		Duel.Damage(1-tp,sum,REASON_EFFECT)
		Duel.Remove(c,POS_FACEUP,REASON_EFFECT)
		Duel.Remove(g,POS_FACEUP,REASON_EFFECT)
	end
end
