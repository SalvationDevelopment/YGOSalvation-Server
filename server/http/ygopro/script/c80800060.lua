--ＲＤＭ－ヌメロン・フォール
function c80800060.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c80800060.target)
	e1:SetOperation(c80800060.activate)
	c:RegisterEffect(e1)
end
function c80800060.filter1(c,e,tp)
	local rk=c:GetRank()
	return rk>0 and c:IsFaceup() and c:IsSetCard(0x7f) and Duel.IsExistingMatchingCard(c80800060.filter2,tp,LOCATION_EXTRA,0,1,nil,rk,e,tp)
end
function c80800060.filter2(c,rk,e,tp)
	return c:IsRankBelow(rk-1) and c:IsSetCard(0x7f)
		and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_XYZ,tp,false,false)
end
function c80800060.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c80800060.filter1(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingTarget(c80800060.filter1,tp,LOCATION_MZONE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectTarget(tp,c80800060.filter1,tp,LOCATION_MZONE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80800060.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) or tc:IsControler(1-tp) or tc:IsImmuneToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80800060.filter2,tp,LOCATION_EXTRA,0,1,1,nil,tc:GetRank(),e,tp)
	local sc=g:GetFirst()
	if sc then
		local mg=tc:GetOverlayGroup()
		if mg:GetCount()~=0 then
			Duel.Overlay(sc,mg)
		end
		Duel.Overlay(sc,Group.FromCards(tc))
		Duel.SpecialSummon(sc,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
		--disable
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_BE_BATTLE_TARGET)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCondition(c80800060.discon1)
		e1:SetOperation(c80800060.disop1)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		sc:RegisterEffect(e1)
		sc:CompleteProcedure()
	end
end
function c80800060.discon1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c and (c==Duel.GetAttacker() or c==Duel.GetAttackTarget()) and c:GetBattleTarget()
	and c:GetSummonType()==SUMMON_TYPE_XYZ
end
function c80800060.disop1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=c:GetBattleTarget()
	c:CreateRelation(tc,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_DISABLE)
	e1:SetProperty(EFFECT_FLAG_OWNER_RELATE)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
	e1:SetCondition(c80800060.discon2)
	tc:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_CHAIN_SOLVING)
	e2:SetRange(LOCATION_MZONE)
	e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
	e2:SetOperation(c80800060.disop2)
	e2:SetLabelObject(tc)
	c:RegisterEffect(e2)
end
function c80800060.discon2(e)
	return e:GetOwner():IsRelateToCard(e:GetHandler())
end
function c80800060.disop2(e,tp,eg,ep,ev,re,r,rp)
	local loc=Duel.GetChainInfo(ev,CHAININFO_TRIGGERING_LOCATION)
	if loc==LOCATION_MZONE and re:GetHandler()==e:GetLabelObject() then
		Duel.NegateEffect(ev)
	end
end
