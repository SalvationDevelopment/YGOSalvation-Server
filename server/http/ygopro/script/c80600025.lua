--武神器—イクタ
function c80600025.initial_effect(c)
	--destroy
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_POSITION+CATEGORY_DEFCHANGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCondition(c80600025.descon)
	e1:SetCost(c80600025.descost)
	e1:SetTarget(c80600025.destg)
	e1:SetOperation(c80600025.desop)
	c:RegisterEffect(e1)
end
function c80600025.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x88)
end
function c80600025.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80600025.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80600025.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600025)==0 and e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
	Duel.RegisterFlagEffect(tp,80600025,RESET_PHASE+PHASE_END,0,1)
end
function c80600025.filter(c)
	return c:IsFaceup() and c:IsCanBeEffectTarget()
end
function c80600025.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsControler(1-tp) and c80600025.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80600025.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUPDEFENCE)
	local g=Duel.SelectTarget(tp,c80600025.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c80600025.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		if Duel.ChangePosition(tc,POS_FACEUP_DEFENCE) then
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_SET_DEFENCE_FINAL)
			e1:SetValue(0)
			e1:SetReset(RESET_EVENT+0x1fe0000)
			tc:RegisterEffect(e1)
		end
	end
end
