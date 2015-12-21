--天命の聖剣
function c80600088.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c80600088.target)
	e1:SetOperation(c80600088.operation)
	c:RegisterEffect(e1)
	--cannot be Target
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_EQUIP)
	e2:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e2:SetValue(c80600088.valcon)
	c:RegisterEffect(e2)
	--Equip limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_EQUIP_LIMIT)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetValue(c80600088.eqlimit)
	c:RegisterEffect(e3)
	--special
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80600088,0))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_GRAVE)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetCondition(c80600088.spcon)
	e4:SetCost(c80600088.spcost)
	e4:SetTarget(c80600088.sptg)
	e4:SetOperation(c80600088.spop)
	c:RegisterEffect(e4)
end
function c80600088.eqlimit(e,c)
	return c:IsSetCard(0x107a)
end
function c80600088.eqfilter1(c)
	return c:IsFaceup() and  c:IsSetCard(0x107a)
end
function c80600088.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c80600088.eqfilter1(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80600088.eqfilter1,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	Duel.SelectTarget(tp,c80600088.eqfilter1,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c80600088.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() and c:CheckUniqueOnField(tp) then
		Duel.Equip(tp,c,tc)
	end
end
function c80600088.valcon(e,re,rp)
	return rp~=e:GetHandlerPlayer()
end
function c80600088.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetTurnID()~=Duel.GetTurnCount()
end
function c80600088.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost()
		and	Duel.GetFlagEffect(tp,80600066)==0
	end
	Duel.RegisterFlagEffect(tp,80600066,RESET_PHASE+PHASE_END,0,1)
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c80600088.filter1(c,e,tp)
	return c:IsFaceup() and c:IsSetCard(0x107a) and c:IsType(TYPE_XYZ) and 
	Duel.IsExistingMatchingCard(c80600088.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,c:GetCode())
end
function c80600088.filter2(c,e,tp,code)
	return not c:IsCode(code) and c:IsSetCard(0x107a) and c:IsType(TYPE_XYZ) 
		and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_XYZ,tp,false,false)
end
function c80600088.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c80600088.filter1(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingTarget(c80600088.filter1,tp,LOCATION_MZONE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectTarget(tp,c80600088.filter1,tp,LOCATION_MZONE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80600088.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) or tc:IsControler(1-tp) or tc:IsImmuneToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80600088.filter2,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tc:GetCode())
	local sc=g:GetFirst()
	if sc then
		local mg=tc:GetOverlayGroup()
		if mg:GetCount()~=0 then
			Duel.Overlay(sc,mg)
		end
		Duel.Overlay(sc,Group.FromCards(tc))
		Duel.SpecialSummon(sc,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
		sc:CompleteProcedure()
	end
end
