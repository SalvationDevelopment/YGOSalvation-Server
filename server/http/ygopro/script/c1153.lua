--リボーンリボン
function c1153.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c1153.target)
	e1:SetOperation(c1153.operation)
	c:RegisterEffect(e1)
	--Equip limit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_EQUIP_LIMIT)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetValue(c1153.eqlimit)
	c:RegisterEffect(e2)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c1153.regcon)
	e3:SetOperation(c1153.regop)
	c:RegisterEffect(e3)
end
function c1153.eqlimit(e,c)
	return not c:IsHasEffect(EFFECT_CANNOT_SPECIAL_SUMMON)
end
function c1153.filter(c)
	return c:IsFaceup() and not c:IsHasEffect(EFFECT_CANNOT_SPECIAL_SUMMON)
end
function c1153.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c1153.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c1153.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	Duel.SelectTarget(tp,c1153.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c1153.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Equip(tp,c,tc)
	end
end
function c1153.regcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local ec=c:GetPreviousEquipTarget()
	return c:IsReason(REASON_LOST_TARGET) and ec:IsReason(REASON_BATTLE) and ec:IsLocation(LOCATION_GRAVE)
end
function c1153.regop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local ec=c:GetPreviousEquipTarget()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1153,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCountLimit(1)
	e1:SetTarget(c1153.sptg)
	e1:SetOperation(c1153.spop)
	e1:SetLabelObject(ec)
	e1:SetReset(RESET_EVENT+0x16c0000+RESET_PHASE+PHASE_END)
	e:GetHandler():RegisterEffect(e1)
	ec:RegisterFlagEffect(1153,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c1153.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local ec=e:GetHandler():GetPreviousEquipTarget()
	if chk==0 then return ec:GetFlagEffect(1153)~=0 end
	Duel.SetTargetCard(ec)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,ec,1,0,0)
end
function c1153.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
