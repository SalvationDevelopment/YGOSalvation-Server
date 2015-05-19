--Insight Magician
function c72714461.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(72714461,0))
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY+CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTarget(c72714461.destg)
	e2:SetOperation(c72714461.desop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(72714461,1))
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_HAND)
	e3:SetCost(c72714461.cost)
	e3:SetTarget(c72714461.target)
	e3:SetOperation(c72714461.activate)
	c:RegisterEffect(e3)

end
function c72714461.pfilter(c)
	return c:IsType(TYPE_PENDULUM) and c:IsSetCard(0x98) and c:GetCode()~=72714461
end
function c72714461.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq)
	if not tc or not Duel.IsExistingMatchingCard(c72714461.pfilter,tp,LOCATION_DECK,0,1,nil) then return end
	if chk==0 then return Duel.IsExistingMatchingCard(c72714461.pfilter,tp,LOCATION_DECK,0,1,nil)
		and tc and tc:IsSetCard(0x9f) or tc:IsSetCard(0x98) and e:GetHandler():IsDestructable() end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,e:GetHandler(),1,0,0)
end
function c72714461.desop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	if Duel.Destroy(e:GetHandler(),REASON_EFFECT)~=0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOFIELD)
		local g=Duel.SelectMatchingCard(tp,c72714461.pfilter,tp,LOCATION_DECK,0,1,1,nil)
		local tc=g:GetFirst()
		if tc then
			Duel.MoveToField(tc,tp,tp,LOCATION_SZONE,7,POS_FACEUP,true)
			Duel.ChangePosition(tc,POS_FACEUP)
		end
	end
end

function c72714461.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
end
function c72714461.filter(c)
	return c:IsFaceup() and (c:GetSequence()==6 or c:GetSequence()==7) and
	(c:GetCode()==20409757 and c:GetLeftScale()~=8) or 
	(c:GetCode()==13790535 and c:GetLeftScale()~=8) or 
	(c:GetCode()==5665     and c:GetLeftScale()~=8) or 	
	(c:GetCode()==81571633 and c:GetLeftScale()~=8) or 
	(c:GetCode()==94415058 and c:GetLeftScale()~=1) or 
	(c:GetCode()==74605254 and c:GetLeftScale()~=1) or 
	(c:GetCode()==11609969 and c:GetLeftScale()~=10) or 
	(c:GetCode()==17979378 and c:GetLeftScale()~=6)
end
function c72714461.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_SZONE) and c72714461.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c72714461.filter,tp,LOCATION_SZONE,LOCATION_SZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectTarget(tp,c72714461.filter,tp,LOCATION_SZONE,LOCATION_SZONE,1,1,nil)
end
function c72714461.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:GetCode()==20409757 or tc:GetCode()==13790535 or tc:GetCode()==5665  or tc:GetCode()==81571633 then scale=8 end
	if tc:GetCode()==94415058 or tc:GetCode()==74605254 then scale=1 end
	if tc:GetCode()==17979378 then scale=6 end
	if tc:GetCode()==11609969 then scale=10 end
	if tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_LSCALE)
		e1:SetValue(scale)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		tc:RegisterEffect(e1)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_CHANGE_RSCALE)
		tc:RegisterEffect(e2)
	end
end
