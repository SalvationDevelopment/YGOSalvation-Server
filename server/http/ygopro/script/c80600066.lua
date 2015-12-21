--旗鼓堂々
function c80600066.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCost(c80600066.cost)
	e1:SetTarget(c80600066.eqtg)
	e1:SetOperation(c80600066.eqop)
	c:RegisterEffect(e1)
end
function c80600066.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return not Duel.CheckSpecialSummonActivity(tp) and Duel.GetFlagEffect(tp,80600066)==0 end
	--oath effects
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	Duel.RegisterEffect(e1,tp)
	Duel.RegisterFlagEffect(tp,80600066,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end

function c80600066.filter(c)
	return c:IsType(TYPE_EQUIP) and Duel.IsExistingMatchingCard(c80600066.filter2,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil,c)
end
function c80600066.filter2(c,ec)
	return ec:CheckEquipTarget(c) and c:IsFaceup()
end
function c80600066.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80600066.filter(chkc,e:GetHandler()) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c80600066.filter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local tc=Duel.SelectTarget(tp,c80600066.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	local tc2=Duel.SelectTarget(tp,c80600066.filter2,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil,tc:GetFirst())
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,g,1,0,0)
end
function c80600066.eqop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_SZONE)<=0 then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc2=g:GetFirst()
	local tc=g:GetNext()
	if tc:IsRelateToEffect(e) and tc2:IsFaceup() and tc2:IsRelateToEffect(e) then
		Duel.Equip(tp,tc,tc2)
		tc:RegisterFlagEffect(80600066,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetReset(RESET_PHASE+PHASE_END)
		e1:SetCountLimit(1)
		e1:SetLabelObject(tc)
		e1:SetOperation(c80600066.desop)
		Duel.RegisterEffect(e1,tp)
	end
end

function c80600066.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	if tc:GetFlagEffect(80600066)>0 then
	Duel.Destroy(tc,REASON_EFFECT)
	end
end
